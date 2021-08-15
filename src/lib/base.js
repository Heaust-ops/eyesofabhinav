import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import TPPCamera from "./TPPCamera";
import prepareGeometry from "./PrepareGeometry";
import prepareStandardMaterial from "./PrepareStandardMaterial";
import Debug from "./DebugBasicMesh";
// import { Text } from "troika-three-text";

class Base {
  constructor({
    customInitFunc = false,
    ambientLight = 0x404040,
    debug = false,
  } = {}) {
    this._Initialize({ ambientLight, customInitFunc, debug });
  }

  _Initialize({ ambientLight, customInitFunc, debug } = {}) {
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._shadowMapResolution = [2048, 2048];
    this.enableAverageFrameRateCalculation = false;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.physicallyCorrectLights = true;
    this._gltfLoader = new GLTFLoader();
    this._textureLoader = new THREE.TextureLoader();
    this._cubeTextureLoader = new THREE.CubeTextureLoader();
    this.prepareStandardMaterial = prepareStandardMaterial;
    this.prepareGeometry = prepareGeometry;

    this._renderer.domElement.setAttribute("id", "three-canvas");
    this._renderer.domElement.style.zIndex = "1";

    document.body.appendChild(this._renderer.domElement);
    this._aspect = "w/h";

    window.addEventListener(
      "resize",
      () => {
        this._OnWindowResize();
      },
      false
    );

    this._scene = new THREE.Scene();
    this._animations = [];

    this._ambientLight = new THREE.AmbientLight(ambientLight);
    this._scene.add(this._ambientLight);
    this._mixers = [];
    this._steps = [];
    this._attrs = [];
    this._frameRateDisplay = document.getElementById("frame-rate");
    this._frameRateDisplayContainer = document.getElementById(
      "frame-rate-container"
    );

    this._debug = debug;
    if (this._debug) {
      const debugObject = new Debug();
      this._debugBasicMesh = debugObject.debugBasicMesh;
      this._gui = debugObject.gui;
      this.addDebugFolder = debugObject.addDebugFolder;
    } else {
      this.addDebugFolder = () => {};
    }

    if (customInitFunc) customInitFunc(this);

    if (this.enableAverageFrameRateCalculation) {
      this.localFrameRateAverage = 60;
      this._localFrameRateNumerator = 0;
      this._localFrameRateDenominator = 1;
      this._localFrameRateTimeElapsed = 0;
      this.addStep((t, parent) => {
        if (t) {
          parent._localFrameRateTimeElapsed += t;
          parent._localFrameRateNumerator += 1 / t;
          parent.localFrameRateAverage =
            parent._localFrameRateNumerator / parent._localFrameRateDenominator;
          parent._localFrameRateDenominator++;
          if (parent._localFrameRateTimeElapsed > 9) {
            parent._localFrameRateNumerator = 0;
            parent._localFrameRateDenominator = 1;
            parent._localFrameRateTimeElapsed = 0;
          }
        }
      });
    }

    this._RAF();
  }

  get TextureFilters() {
    return {
      NearestFilter: THREE.NearestFilter,
      LinearFilter: THREE.LinearFilter,
      NearestMipmapNearestFilter: THREE.NearestMipmapNearestFilter,
      NearestMipmapLinearFilter: THREE.NearestMipmapLinearFilter,
      LinearMipmapNearestFilter: THREE.LinearMipmapNearestFilter,
      LinearMipmapLinearFilter: THREE.LinearMipmapLinearFilter,
    };
  }

  get Wrapping() {
    return {
      MirroredRepeatWrapping: THREE.MirroredRepeatWrapping,
      RepeatWrapping: THREE.RepeatWrapping,
    };
  }

  get scene() {
    return this._scene;
  }

  // addText(
  //   text,
  //   {
  //     position = [0, 10, 0],
  //     rotation = [0, 0, 0],
  //     fontSize = 0.5,
  //     color = 0x9966ff,
  //   } = {},
  //   {
  //     debug = true,
  //     debugName = "genericText" + this.random(0, 10000),
  //     debugPosMin = [-150, -150, -150],
  //     debugPosMax = [150, 150, 150],
  //     debugRotMin = [-Math.PI, -Math.PI, -Math.PI],
  //     debugRotMax = [Math.PI, Math.PI, Math.PI],
  //     debugPosStep = 0.01,
  //     debugRotStep = 0.01,
  //     debugFolder = this._gui,
  //   } = {}
  // ) {
  //   const newText = new Text();
  //   newText.text = text;
  //   newText.color = color;
  //   newText.fontSize = fontSize;
  //   newText.position.set(...position);
  //   newText.rotation.set(...rotation);
  //   this._scene.add(newText);

  //   // Debug
  //   this._debugBasicMesh({
  //     debugMesh: newText,
  //     debug,
  //     color,
  //     debugName,
  //     debugPosMin,
  //     debugPosMax,
  //     debugRotMin,
  //     debugRotMax,
  //     debugPosStep,
  //     debugRotStep,
  //     debugFolder,
  //   });
  // }





  random(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  randomColor() {
    let color = "#";
    for (let i = 0; i < 6; i++) {
      const random = Math.random();
      const bit = (random * 16) | 0;
      color += bit.toString(16);
    }
    return color;
  }

  lockTPPCamera(
    target,
    cameraParams = {},
    offset = [-15, 20, -30],
    lookat = [0, 10, 50]
  ) {
    this.addCamera({ ...cameraParams, orbital: false });
    this._TPPCamera = new TPPCamera(this._camera, target, offset, lookat);
    return this.addStep((t, parent) => {
      parent._TPPCamera.Update(t);
    });
  }

  unlockTPPCamera(key, orbital = true) {
    this.removeStep(key);
    if (orbital) {
      const controls = new OrbitControls(
        this._camera,
        this._renderer.domElement
      );
      controls.update();
    }
  }

  loadAnimatedFBXModel({
    CharacterController,
    path,
    character = "character.fbx",
    walk = "walk.fbx",
    run = "run.fbx",
    idle = "idle.fbx",
    dance = "dance.fbx",
    size = 0.1,
    pos = [0, 0, 0],
  } = {}) {
    this._controls = new CharacterController({
      path,
      camera: this._camera,
      scene: this._scene,
      character,
      walk,
      run,
      idle,
      dance,
      size,
      pos,
    });

    // console.log(this._controls.position)

    return this._controls;
  }

  execute(func) {
    func(this);
  }

  addDirectionalLight(
    {
      color = 0xffffff,
      from = [100, 100, 100],
      to = [0, 0, 0],
      intensity = 1,
      helper = true,
      shadow = true,
    } = {},
    {
      debug = true,
      debugName = "genericDirectionalLight" + this.random(0, 10000),
      debugPosMin = [-150, -150, -150],
      debugPosMax = [150, 150, 150],
      debugRotMin = [-Math.PI, -Math.PI, -Math.PI],
      debugRotMax = [Math.PI, Math.PI, Math.PI],
      debugPosStep = 0.01,
      debugRotStep = 0.01,
      debugFolder = this._gui,
    } = {}
  ) {
    let light = new THREE.DirectionalLight(color, intensity);
    light.position.set(...from);
    light.target.position.set(...to);
    light.castShadow = true;
    light.shadow.bias = -0.01;
    light.shadow.mapSize.width = this._shadowMapResolution[0];
    light.shadow.mapSize.height = this._shadowMapResolution[1];
    light.shadow.camera.near = 1.0;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = 200;
    light.shadow.camera.right = -200;
    light.shadow.camera.top = 200;
    light.shadow.camera.bottom = -200;
    this._scene.add(light);
    this._scene.add(light.target);
    if (this._debug && helper) {
      const helper = new THREE.DirectionalLightHelper(light, 5);
      this._scene.add(helper);
    }

    // Debug
    if (this._debug) {
      this._debugBasicMesh({
        debugMesh: light,
        debug,
        color,
        debugName,
        debugPosMin,
        debugPosMax,
        debugRotMin,
        debugRotMax,
        debugPosStep,
        debugRotStep,
        debugFolder,
      });
    }

    return light;
  }

  addPointLight(
    {
      color = 0x404040,
      pos = [10, 10, 10],
      intensity = 1,
      decay = 2,
      distance = 0,
      helper = true,
      shadow = true,
    } = {},
    {
      debug = true,
      debugName = "genericPointLight" + this.random(0, 10000),
      debugPosMin = [-150, -150, -150],
      debugPosMax = [150, 150, 150],
      debugRotMin = [-Math.PI, -Math.PI, -Math.PI],
      debugRotMax = [Math.PI, Math.PI, Math.PI],
      debugPosStep = 0.01,
      debugRotStep = 0.01,
      debugFolder = this._gui,
    } = {}
  ) {
    const light = new THREE.PointLight(color, intensity, distance, decay);
    light.position.set(...pos);

    if (shadow) {
      light.castShadow = true;
      light.shadow.bias = -0.01;
      light.shadow.mapSize.width = this._shadowMapResolution[0];
      light.shadow.mapSize.height = this._shadowMapResolution[1];
      light.shadow.camera.near = 1.0;
      light.shadow.camera.far = 500;
      light.shadow.camera.left = 200;
      light.shadow.camera.right = -200;
      light.shadow.camera.top = 200;
      light.shadow.camera.bottom = -200;
    }

    this._scene.add(light);
    if (this._debug && helper) {
      const sphereSize = 1;
      const pointLightHelper = new THREE.PointLightHelper(light, sphereSize);
      this._scene.add(pointLightHelper);
    }

    // Debug
    if (this._debug) {
      this._debugBasicMesh({
        debugMesh: light,
        debug,
        color,
        debugName,
        debugPosMin,
        debugPosMax,
        debugRotMin,
        debugRotMax,
        debugPosStep,
        debugRotStep,
        debugFolder,
      });
    }
    return light;
  }

  skybox(param) {
    // param will be an array of image paths
    const texture = this._cubeTextureLoader.load(param);
    this._scene.background = texture;
  }

  addCamera({
    from = [70, 20, 0],
    to = [0, 0, 0],
    fov = 60,
    aspect = "w/h",
    near = 1.0,
    far = 1000.0,
    orbital = true,
  } = {}) {
    this._aspect = aspect;
    if (aspect == "w/h") aspect = window.innerWidth / window.innerHeight;
    if (aspect == "h/w") aspect = window.innerHeight / window.innerWidth;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(...from);
    if (orbital) {
      const controls = new OrbitControls(
        this._camera,
        this._renderer.domElement
      );
      controls.target.set(...to);
      controls.update();
    }
    return this._camera;
  }

  addAnimation(f) {
    this._animations.push(f);
    return this._animations.length - 1; // the id or index of the function
  }

  removeAnimation(id) {
    // index of function in the array
    this._animations.splice(id, 1);
  }

  getCurvedPlaneGeometry({ width = 50, height = 50, radius = 20 } = {}) {
    let x = 1;
    let y = 1;

    let shape = new THREE.Shape();
    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.quadraticCurveTo(x, y + height, x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.quadraticCurveTo(
      x + width,
      y + height,
      x + width,
      y + height - radius
    );
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);

    return new THREE.ShapeBufferGeometry(shape);
  }

  addBufferGeometry({
    float32array = [0, 0, 0, 0, 1, 0, 1, 0, 0],
    vertexLength = 3,
    color = 0x808080,
    pos = [0, 0, 0],
    castShadow = true,
    receiveShadow = true,
    rotationX = 0,
    rotationY = 0,
    rotationZ = 0,
    map = false,
    bumpMap = false,
    normalMap = false,
    wireframe = false,
  } = {}) {
    const positionArray = new Float32Array(
      float32array.map((e, i) => {
        return e + pos[i % 3];
      })
    );
    const positionsAttribute = new THREE.BufferAttribute(
      positionArray,
      vertexLength
    );
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", positionsAttribute);
    const a = map ? { map: this._textureLoader.load(map) } : {};
    const b = bumpMap ? { bumpMap: this._textureLoader.load(bumpMap) } : {};
    const c = normalMap
      ? { normalMap: this._textureLoader.load(normalMap) }
      : {};
    const d = map ? {} : { color: color };
    const meshParams = { ...a, ...b, ...c, ...d, wireframe };
    const bufferMesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial(meshParams)
    );
    bufferMesh.position.set(...pos);
    bufferMesh.castShadow = castShadow;
    bufferMesh.receiveShadow = receiveShadow;
    bufferMesh.rotation.x = rotationX;
    bufferMesh.rotation.y = rotationY;
    bufferMesh.rotation.z = rotationZ;
    this._scene.add(bufferMesh);
    return bufferMesh;
  }

  /**
   * Adds a Basic Shape to Scene
   *
   * @param {*} Shape
   * @param {*} GeometryOptions
   * @param {*} MaterialOptions
   * @param {*} DebugOptions
   * @returns The Mesh Object Corresponding to that Shape
   */
  addShape(
    shape,
    {
      geometry = false,
      dimensions = false,
      segments = false,
      pos = [0, 0, 0],
      rotation = [-Math.PI / 2, 0, 0],
      castShadow = true,
      receiveShadow = true,
      duplicateUV = false,
    } = {},
    {
      color = 0x808080,
      colorMultiply = false,
      material = false,
      side = "front",
      wireframe = false,
      flatShading = false,
      repeat = false,
      texturesPath = false,
      refractionRatio = 0.98,
      /** Color Map */
      map = false,
      /** Bump Map */
      bumpMap = false,
      bumpScale = 1.0,
      /** Normal Map */
      normalMap = false,
      normalScale = [1, 1],
      /** Displacement Map */
      displacementMap = false,
      displacementScale = 1.0,
      displacementBias = 0.0,
      /** Emission, Color and Map */
      emissiveMap = false,
      emissiveIntensity = 1.0,
      emissiveColor = 0x000000,
      /** Env Map */
      envMap = false,
      envMapIntensity = false,
      /** Light Map */
      lightMap = false,
      lightMapIntensity = 1.0,
      /** Alpha Map */
      alphaMap = false,
      /** Ambient Occlusion Map */
      aoMap = false,
      aoMapIntensity = 1.0,
      /** Metalness */
      metalness = 0.0, // If metalnessMap is also provided, both values are multiplied.
      metalnessMap = false,
      /** Roughness */
      roughness = 1.0, // If roughnessMap is also provided, both values are multiplied.
      roughnessMap = false,
      /** Texture Filters */
      filters = {
        mag: {
          map: false,
          bumpMap: false,
          normalMap: false,
        },
        min: {
          map: false,
          bumpMap: false,
          normalMap: false,
        },
      },
    } = {},
    {
      debug = true,
      debugName = shape + this.random(0, 10000),
      debugPosMin = [-150, -150, -150],
      debugPosMax = [150, 150, 150],
      debugRotMin = [-Math.PI, -Math.PI, -Math.PI],
      debugRotMax = [Math.PI, Math.PI, Math.PI],
      debugPosStep = 0.01,
      debugRotStep = 0.01,
      debugFolder = this._gui,
    } = {}
  ) {
    if (!geometry) {
      /** Creating Geometry */
      geometry = this.prepareGeometry(shape, dimensions, segments, duplicateUV);
    }

    if (!material) {
      /** Creating Material */
      material = this.prepareStandardMaterial({
        color,
        colorMultiply,
        side,
        texturesPath,
        wireframe,
        repeat,
        flatShading,
        refractionRatio,
        map,
        bumpMap,
        bumpScale,
        normalMap,
        normalScale,
        displacementMap,
        displacementScale,
        displacementBias,
        emissiveMap,
        emissiveIntensity,
        emissiveColor,
        envMap,
        envMapIntensity,
        lightMap,
        lightMapIntensity,
        alphaMap,
        aoMap,
        aoMapIntensity,
        metalness,
        metalnessMap,
        roughness,
        roughnessMap,
        filters,
      });
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...pos);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    mesh.rotation.x = rotation[0];
    mesh.rotation.y = rotation[1];
    mesh.rotation.z = rotation[2];
    this._scene.add(mesh);

    /**
     * Debug
     */
    if (this._debug) {
      this._debugBasicMesh({
        debugMesh: mesh,
        debug,
        color,
        debugName,
        debugPosMin,
        debugPosMax,
        debugRotMin,
        debugRotMax,
        debugPosStep,
        debugRotStep,
        debugFolder,
      });
    }

    return mesh;
  }

  _OnWindowResize() {
    if (this._aspect == "w/h")
      this._camera.aspect = window.innerWidth / window.innerHeight;
    else if (this._aspect == "h/w")
      this._camera.aspect = window.innerHeight / window.innerWidth;
    else this._camera.aspect = this._aspect;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  loadAnimatedFBXModelAndPlay(
    path,
    modelFile,
    animFile,
    pos = [0, 0, 0],
    size = 0.1
  ) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(modelFile, (fbx) => {
      fbx.scale.setScalar(size);
      fbx.traverse((c) => {
        c.castShadow = true;
      });
      fbx.position.copy(new THREE.Vector3(...pos));

      const anim = new FBXLoader();
      anim.setPath(path);
      anim.load(animFile, (anim) => {
        const m = new THREE.AnimationMixer(fbx);
        this._mixers.push(m);
        const idle = m.clipAction(anim.animations[0]);
        idle.play();
      });
      this._scene.add(fbx);
    });
  }

  loadFBXModel(path, modelFile, pos = [0, 0, 0], size = 0.1) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(modelFile, (fbx) => {
      fbx.scale.setScalar(size);
      fbx.traverse((c) => {
        c.castShadow = true;
      });
      fbx.position.copy(new THREE.Vector3(...pos));
      this._scene.add(fbx);
    });
  }

  loadGLTFModel(
    modelPath,
    pos = [0, 0, 0],
    size = 1,
    {
      debugName = "GLTFModel" + this.random(0, 10000),
      debugFolder = this._gui,
    } = {}
  ) {
    const attrKey = this._attrs.length;
    const loader = this._gltfLoader;
    loader.load(modelPath, (gltf) => {
      gltf.scene.scale.set(size, size, size);
      gltf.scene.traverse((c) => {
        c.castShadow = true;
      });
      gltf.scene.position.copy(new THREE.Vector3(...pos));
      this._scene.add(gltf.scene);
      this._attrs.push(gltf.scene);
      if (this._debug) {
        this._debugBasicMesh({
          debugMesh: gltf.scene,
          debugFolder,
          debug: true,
          debugName,
          debugMinSize: size - 10,
          debugMaxSize: size + 10,
        });
      }
    });
    return attrKey;
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      // Recursively Render
      this._renderer.render(this._scene, this._camera);
      this._RAF();

      // Play Animations
      if (this._animations.length !== 0) {
        this._animations.forEach((f) => {
          f(this);
        });
      }
      // Step
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  addAttr(f) {
    this._attrs.push(f);
    return this._attrs.length - 1; // Id or index of the Step
  }

  removeAttr(id) {
    this._attrs.splice(id, 1);
  }

  getAttr(key) {
    return this._attrs[key];
  }

  addStep(f) {
    this._steps.push(f);
    if (f.length < 1) {
      console.log("Function must contain at least 1 arg: Time Elapsed (s)");
      console.log("addAnimation may be what you're looking for");
      return;
    }
    return this._steps.length - 1; // Id or index of the Step
  }

  removeStep(id) {
    this._steps.splice(id, 1);
  }

  frameRateDisplay(toggle = "toggle", type = "paused") {
    const frameratestep = (t) => {
      switch (type) {
        case "local average":
          this._frameRateDisplay.innerHTML =
            "frame rate: " + Math.floor(this.localFrameRateAverage);
          break;
        case "paused":
        default:
          if (Math.floor(Date.now() / 1000) % 2 == 0)
            this._frameRateDisplay.innerHTML =
              "frame rate: " + Math.floor(1 / t);
      }
    };
    if (toggle == "toggle") {
      if (this._frameRateDisplayContainer.style.display == "none") {
        this._frameRateDisplayContainer.style.display = "block";
        this._frameRateDisplayKey = this.addStep(frameratestep);
        return;
      }
      if (
        this._frameRateDisplayContainer.style.display == "block" ||
        this._frameRateDisplayKey === undefined
      ) {
        this._frameRateDisplayContainer.style.display = "none";
        this.removeStep(this._frameRateDisplayKey);
        this._frameRateDisplayKey = undefined;
        return;
      }
    }
    if (toggle == "enable") {
      if (this._frameRateDisplayContainer.style.display == "none") return;
      this._frameRateDisplayContainer.style.display = "block";
      this._frameRateDisplayKey = this.addStep(frameratestep);
      return;
    }
    if (toggle == "disable") {
      if (
        this._frameRateDisplayContainer.style.display == "block" ||
        this._frameRateDisplayKey === undefined
      )
        return;
      this._frameRateDisplayContainer.style.display = "none";
      this.removeStep(this._frameRateDisplayKey);
      this._frameRateDisplayKey = undefined;
      return;
    }
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map((m) => m.update(timeElapsedS));
    }

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }

    if (this._steps.length !== 0) {
      this._steps.forEach((f) => {
        if (f.length == 1) f(timeElapsedS);
        if (f.length == 2) f(timeElapsedS, this);
      });
    }
  }
}

export default Base;
