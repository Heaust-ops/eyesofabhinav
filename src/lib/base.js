import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import TPPCamera from "./TPPCamera";
import * as dat from "dat.gui";
import gsap from "gsap";

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
    this._renderer.shadowMap.enabled = false;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._shadowMapResolution = [2048, 2048];
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.physicallyCorrectLights = true;

    this._renderer.domElement.setAttribute('id', 'three-canvas');
    this._renderer.domElement.style.zIndex = "-1";

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
    this._textureLoader = new THREE.TextureLoader();
    this._cubeTextureLoader = new THREE.CubeTextureLoader();

    this._debug = debug;
    if (this._debug) this._gui = new dat.GUI({ width: 600 });

    if (customInitFunc) customInitFunc(this);

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

  addDebugFolder(name = "generic" + this.random(0, 10000), parent = this._gui) {
    if (this._debug) return parent.addFolder(name);
  }

  _debugBasicMesh({
    debugMesh = false,
    debug = true,
    color = "#223344",
    debugName = "genericMesh" + this.random(0, 10000),
    debugPosMin = [-150, -150, -150],
    debugPosMax = [150, 150, 150],
    debugRotMin = [-Math.PI, -Math.PI, -Math.PI],
    debugRotMax = [Math.PI, Math.PI, Math.PI],
    debugPosStep = 0.01,
    debugRotStep = 0.01,
    debugMinSize = -5,
    debugMaxSize = 5,
    debugFolder = this._gui,
  } = {}) {
    if (debug && this._debug && debugMesh) {
      const folder = debugFolder.addFolder(debugName);
      const parameters = {
        color,
        scale: 1,
        spinX: () => {
          gsap.to(debugMesh.rotation, {
            duration: 1,
            x: debugMesh.rotation.x + Math.PI * 2,
          });
        },
        spinY: () => {
          gsap.to(debugMesh.rotation, {
            duration: 1,
            y: debugMesh.rotation.y + Math.PI * 2,
          });
        },
        spinZ: () => {
          gsap.to(debugMesh.rotation, {
            duration: 1,
            z: debugMesh.rotation.z + Math.PI * 2,
          });
        },
      };
      folder
        .add(debugMesh.position, "x")
        .min(debugPosMin[0])
        .max(debugPosMax[0])
        .step(
          debugPosStep.constructor === Array ? debugPosStep[0] : debugPosStep
        )
        .name("pos-x");
      folder
        .add(debugMesh.position, "y")
        .min(debugPosMin[1])
        .max(debugPosMax[1])
        .step(
          debugPosStep.constructor === Array ? debugPosStep[1] : debugPosStep
        )
        .name("pos-y");
      folder
        .add(debugMesh.position, "z")
        .min(debugPosMin[2])
        .max(debugPosMax[2])
        .step(
          debugPosStep.constructor === Array ? debugPosStep[2] : debugPosStep
        )
        .name("pos-z");
      folder
        .add(debugMesh.rotation, "x")
        .min(debugRotMin[0])
        .max(debugRotMax[0])
        .step(
          debugRotStep.constructor === Array ? debugRotStep[0] : debugRotStep
        )
        .name("rot-x");
      folder
        .add(debugMesh.rotation, "y")
        .min(debugRotMin[1])
        .max(debugRotMax[1])
        .step(
          debugRotStep.constructor === Array ? debugRotStep[1] : debugRotStep
        )
        .name("rot-y");
      folder
        .add(debugMesh.rotation, "z")
        .min(debugRotMin[2])
        .max(debugRotMax[2])
        .step(
          debugRotStep.constructor === Array ? debugRotStep[2] : debugRotStep
        )
        .name("rot-z");
      folder
        .add(parameters, "scale")
        .min(debugMinSize)
        .max(debugMaxSize)
        .step(0.01)
        .onChange(() => {
          debugMesh.scale.x = parameters.scale;
          debugMesh.scale.y = parameters.scale;
          debugMesh.scale.z = parameters.scale;
        })
        .name("size");
      folder.add(debugMesh, "visible");
      if (debugMesh.material) folder.add(debugMesh.material, "wireframe");
      folder.add(parameters, "spinX");
      folder.add(parameters, "spinY");
      folder.add(parameters, "spinZ");
      if (debugMesh.material)
        folder.addColor(parameters, "color").onChange(() => {
          debugMesh.material.color.set(parameters.color);
        });
    }
  }

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

  prepareStandardMaterial({
    color = 0x808080,
    side = "front",
    colorMultiply = false,
    texturesPath = false,
    wireframe = false,
    flatShading = false,
    repeat = false,
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
  } = {}) {
    let material = new THREE.MeshStandardMaterial();

    // Default names for textures

    bumpMap =
      texturesPath && (bumpMap == "png" || bumpMap == "jpg")
        ? texturesPath + "/bump." + bumpMap
        : bumpMap;
    map =
      texturesPath && (map == "png" || map == "jpg")
        ? texturesPath + "/color." + map
        : map;
    normalMap =
      texturesPath && (normalMap == "png" || normalMap == "jpg")
        ? texturesPath + "/normal." + normalMap
        : normalMap;
    displacementMap =
      texturesPath && (displacementMap == "png" || displacementMap == "jpg")
        ? texturesPath + "/displacement." + displacementMap
        : displacementMap;
    emissiveMap =
      texturesPath && (emissiveMap == "png" || emissiveMap == "jpg")
        ? texturesPath + "/emissive." + emissiveMap
        : emissiveMap;
    envMap =
      texturesPath && (envMap == "png" || envMap == "jpg")
        ? texturesPath + "/env." + envMap
        : envMap;
    lightMap =
      texturesPath && (lightMap == "png" || lightMap == "jpg")
        ? texturesPath + "/light." + lightMap
        : lightMap;
    alphaMap =
      texturesPath && (alphaMap == "png" || alphaMap == "jpg")
        ? texturesPath + "/alpha." + alphaMap
        : alphaMap;
    aoMap =
      texturesPath && (aoMap == "png" || aoMap == "jpg")
        ? texturesPath + "/ao." + aoMap
        : aoMap;
    metalnessMap =
      texturesPath && (metalnessMap == "png" || metalnessMap == "jpg")
        ? texturesPath + "/metalness." + metalnessMap
        : metalnessMap;
    roughnessMap =
      texturesPath && (roughnessMap == "png" || roughnessMap == "jpg")
        ? texturesPath + "/roughness." + roughnessMap
        : roughnessMap;

    /** Applying Textures */
    if (map) {
      material.map = this._textureLoader.load(map);

      if (repeat) {
        material.map.repeat.set(...repeat);
        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;
      }
    } else {
      material.color = new THREE.Color(color);
    }
    if (bumpMap) {
      material.bumpMap = this._textureLoader.load(bumpMap);
      material.bumpScale = bumpScale;

      if (repeat) {
        material.bumpMap.repeat.set(...repeat);
        material.bumpMap.wrapS = THREE.RepeatWrapping;
        material.bumpMap.wrapT = THREE.RepeatWrapping;
      }
    }
    if (normalMap) {
      material.normalMap = this._textureLoader.load(normalMap);
      material.normalScale = new THREE.Vector2(...normalScale);

      if (repeat) {
        material.normalMap.repeat.set(...repeat);
        material.normalMap.wrapS = THREE.RepeatWrapping;
        material.normalMap.wrapT = THREE.RepeatWrapping;
      }
    }
    if (displacementMap) {
      material.displacementMap = this._textureLoader.load(displacementMap);
      material.displacementScale = displacementScale;
      material.displacementBias = displacementBias;

      if (repeat) {
        material.displacementMap.repeat.set(...repeat);
        material.displacementMap.wrapS = THREE.RepeatWrapping;
        material.displacementMap.wrapT = THREE.RepeatWrapping;
      }
    }
    if (emissiveMap) {
      material.emissiveMap = this._textureLoader.load(emissiveMap);

      if (repeat) {
        material.emissiveMap.repeat.set(...repeat);
        material.emissiveMap.wrapS = THREE.RepeatWrapping;
        material.emissiveMap.wrapT = THREE.RepeatWrapping;
      }
    }
    if (envMap) {
      material.envMap = this._textureLoader.load(envMap);

      if (repeat) {
        material.envMap.repeat.set(...repeat);
        material.envMap.wrapS = THREE.RepeatWrapping;
        material.envMap.wrapT = THREE.RepeatWrapping;
      }
    }
    if (envMapIntensity) {
      material.envMapIntensity = envMapIntensity;
    }
    if (lightMap) {
      material.lightMap = this._textureLoader.load(lightMap);
      material.lightMapIntensity = lightMapIntensity;

      if (repeat) {
        material.lightMap.repeat.set(...repeat);
        material.lightMap.wrapS = THREE.RepeatWrapping;
        material.lightMap.wrapT = THREE.RepeatWrapping;
      }
    }
    if (alphaMap) {
      material.alphaMap = this._textureLoader.load(alphaMap);

      if (repeat) {
        material.alphaMap.repeat.set(...repeat);
        material.alphaMap.wrapS = THREE.RepeatWrapping;
        material.alphaMap.wrapT = THREE.RepeatWrapping;
      }
    }
    if (aoMap) {
      material.aoMap = this._textureLoader.load(aoMap);
      material.aoMapIntensity = aoMapIntensity;

      if (repeat) {
        material.aoMap.repeat.set(...repeat);
        material.aoMap.wrapS = THREE.RepeatWrapping;
        material.aoMap.wrapT = THREE.RepeatWrapping;
      }
    }
    if (metalnessMap) {
      material.metalnessMap = this._textureLoader.load(metalnessMap);

      if (repeat) {
        material.metalnessMap.repeat.set(...repeat);
        material.metalnessMap.wrapS = THREE.RepeatWrapping;
        material.metalnessMap.wrapT = THREE.RepeatWrapping;
      }
    }
    if (roughnessMap) {
      material.roughnessMap = this._textureLoader.load(roughnessMap);

      if (repeat) {
        material.roughnessMap.repeat.set(...repeat);
        material.roughnessMap.wrapS = THREE.RepeatWrapping;
        material.roughnessMap.wrapT = THREE.RepeatWrapping;
      }
    }

    material.flatShading = flatShading;
    material.wireframe = wireframe;
    material.emissiveIntensity = emissiveIntensity;
    material.emissiveColor = emissiveColor;
    material.refractionRatio = refractionRatio;
    material.metalness = metalness;
    material.roughness = roughness;

    if (side.toLowerCase() != "front") {
      if (side.toLowerCase() == "back") material.side = THREE.BackSide;
      else material.side = THREE.DoubleSide;
    }

    // Default names for textures

    bumpMap =
      texturesPath && (bumpMap == "png" || bumpMap == "jpg")
        ? texturesPath + "/bump." + bumpMap
        : bumpMap;
    map =
      texturesPath && (map == "png" || map == "jpg")
        ? texturesPath + "/color." + map
        : map;
    normalMap =
      texturesPath && (normalMap == "png" || normalMap == "jpg")
        ? texturesPath + "/normal." + normalMap
        : normalMap;
    displacementMap =
      texturesPath && (displacementMap == "png" || displacementMap == "jpg")
        ? texturesPath + "/displacement." + displacementMap
        : displacementMap;
    emissiveMap =
      texturesPath && (emissiveMap == "png" || emissiveMap == "jpg")
        ? texturesPath + "/emissive." + emissiveMap
        : emissiveMap;
    envMap =
      texturesPath && (envMap == "png" || envMap == "jpg")
        ? texturesPath + "/env." + envMap
        : envMap;
    lightMap =
      texturesPath && (lightMap == "png" || lightMap == "jpg")
        ? texturesPath + "/light." + lightMap
        : lightMap;
    alphaMap =
      texturesPath && (alphaMap == "png" || alphaMap == "jpg")
        ? texturesPath + "/alpha." + alphaMap
        : alphaMap;
    aoMap =
      texturesPath && (aoMap == "png" || aoMap == "jpg")
        ? texturesPath + "/ao." + aoMap
        : aoMap;
    metalnessMap =
      texturesPath && (metalnessMap == "png" || metalnessMap == "jpg")
        ? texturesPath + "/metalness." + metalnessMap
        : metalnessMap;
    roughnessMap =
      texturesPath && (roughnessMap == "png" || roughnessMap == "jpg")
        ? texturesPath + "/roughness." + roughnessMap
        : roughnessMap;

    /** Applying filters */
    if (filters.mag) {
      if (map) {
        if (filters.mag.map) material.map.magFilter = filters.mag.map;
      }
      if (bumpMap) {
        if (filters.mag.bumpMap)
          material.bumpMap.magFilter = filters.mag.bumpMap;
      }
      if (normalMap) {
        if (filters.mag.normalMap)
          material.normalMap.magFilter = filters.mag.normalMap;
      }
    }
    if (filters.min) {
      if (map) {
        if (filters.min.map) material.map.minFilter = filters.min.map;
      }
      if (bumpMap) {
        if (filters.min.bumpMap)
          material.bumpMap.minFilter = filters.min.bumpMap;
      }
      if (normalMap) {
        if (filters.min.normalMap)
          material.normalMap.minFilter = filters.min.normalMap;
      }
    }

    if (colorMultiply) {
      material.color = new THREE.Color(color);
    }

    return material;
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
      let dim;
      let seg;
      switch (shape.toLowerCase()) {
        case "plane":
          dim = dimensions ? dimensions : [100, 100];
          seg = segments ? segments : [1, 1];
          geometry = new THREE.PlaneBufferGeometry(...dim, ...seg);
          break;
        case "circle":
          dim = dimensions ? dimensions : [5];
          seg = segments ? segments : [32];
          geometry = new THREE.PlaneBufferGeometry(...dim, ...seg);
          break;
        case "cube":
        case "box":
          dim = dimensions ? dimensions : [2, 2, 2];
          seg = segments ? segments : [1, 1, 1];
          geometry = new THREE.BoxBufferGeometry(...dim, ...seg);
          break;
        case "sphere":
          dim = dimensions ? dimensions : [2];
          seg = segments ? segments : [32, 32];
          geometry = new THREE.SphereBufferGeometry(...dim, ...seg);
          break;
        case "torus":
          dim = dimensions ? dimensions : [10, 3];
          seg = segments ? segments : [16, 100];
          geometry = new THREE.TorusBufferGeometry(...dim, ...seg);
          break;
        case "cone":
          dim = dimensions ? dimensions : [1, 4];
          seg = segments ? segments : [8, 1];
          geometry = new THREE.ConeBufferGeometry(...dim, ...seg);
          break;
        case "cylinder":
          dim = dimensions ? dimensions : [5, 5];
          seg = segments ? segments : [20, 32];
          geometry = new THREE.CylinderBufferGeometry(...dim, ...seg);
          break;
        default:
          console.log("Cannot Find the Shape: " + shape);
          return;
      }
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
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
      gltf.scene.scale.set(size, size, size);
      gltf.scene.traverse((c) => {
        c.castShadow = true;
      });
      gltf.scene.position.copy(new THREE.Vector3(...pos));
      this._scene.add(gltf.scene);
      this._attrs.push(gltf.scene);
      this._debugBasicMesh({
        debugMesh: gltf.scene,
        debugFolder,
        debug: true,
        debugName,
        debugMinSize: size - 10,
        debugMaxSize: size + 10,
      });
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
      console.log("Function must contain at require 1 arg: Time Elapsed (s)");
      console.log("addAnimation may be what you're looking for");
      return;
    }
    return this._steps.length - 1; // Id or index of the Step
  }

  removeStep(id) {
    this._steps.splice(id, 1);
  }

  frameRateDisplay(toggle = "toggle", pause = true) {
    const frameratestep = (t) => {
      if (!pause && Math.floor(Date.now() / 1000) % 1 == 0)
        this._frameRateDisplay.innerHTML = "frame rate: " + Math.floor(1 / t);
      if (Math.floor(Date.now() / 1000) % 2 == 0)
        this._frameRateDisplay.innerHTML = "frame rate: " + Math.floor(1 / t);
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
