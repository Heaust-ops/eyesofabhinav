import Base from "./lib/base";
import CharacterController from "./lib/CharacterController";

const base = new Base({
  ambientLight: 0x707070,
  customInitFunc: (parent) => {
    // Custom Init Function
    if (parent) parent._shadowMapResolution = [512, 512];
  },
  debug: true,
});
base.frameRateDisplay();

// Create Room

let floor = base.addShape(
  "Plane",
  {
    dimensions: [230, 230],
    segments: [200, 200],
  },
  {
    texturesPath: "./resources/textures/hexa_wood_tiles_01",
    map: "jpg",
    aoMap: "jpg",
    displacementMap: "png",
    normalMap: "jpg",
    roughnessMap: "jpg",
    displacementScale: 1.0,
    repeat: [8, 8],
  },
  { debugName: "Floor" }
);

let roof = base.addShape(
  "Plane",
  {
    dimensions: [300, 300],
    pos: [0, 49, 0],
    segments: [600, 600],
  },
  {
    color: "#a48163",
    colorMultiply: true,
    texturesPath: "./resources/textures/aerial_asphalt_01",
    map: "jpg",
    aoMap: "jpg",
    displacementMap: "png",
    normalMap: "jpg",
    roughnessMap: "jpg",
    displacementScale: 3.0,
    side: "back",
    repeat: [8, 8],
  },
  { debugName: "Roof" }
);

// Create Walls
const wallTexture = base.prepareStandardMaterial({
  texturesPath: "./resources/textures/wood_wall_coffers_01",
  map: "jpg",
  aoMap: "jpg",
  displacementMap: "png",
  normalMap: "jpg",
  roughnessMap: "jpg",
  displacementScale: 1.0,
  repeat: [1, 1 / 3],
});

const wallsFolder = base.addDebugFolder("walls");
let wall1 = base.addShape(
  "Plane",
  {
    dimensions: [300, 50],
    segments: [900, 30],
    pos: [0, 25, 115],
    rotation: [0, -Math.PI, 0],
    castShadow: false,
  },
  { material: wallTexture },
  { debugFolder: wallsFolder, debugName: "wall1" }
);

let wall2 = base.addShape(
  "Plane",
  {
    dimensions: [300, 50],
    segments: [900, 30],
    pos: [0, 25, -115],
    rotation: [0, 0, 0],
    castShadow: false,
  },
  { material: wallTexture },
  { debugFolder: wallsFolder, debugName: "wall2" }
);

let wall3 = base.addShape(
  "Plane",
  {
    dimensions: [300, 50],
    segments: [900, 30],
    pos: [115, 25, 0],
    rotation: [0, -Math.PI / 2, 0],
    castShadow: false,
  },
  { material: wallTexture },
  { debugFolder: wallsFolder, debugName: "wall3" }
);

let wall4 = base.addShape(
  "Plane",
  {
    dimensions: [300, 50],
    segments: [900, 30],
    pos: [-115, 25, 0],
    rotation: [0, Math.PI / 2, 0],
    castShadow: false,
  },
  { material: wallTexture },
  { debugFolder: wallsFolder, debugName: "wall4" }
);

// END Create Walls

// END Create Room

// Create Photo Panels
let panels = {
  wall1: [[], []],
  wall2: [[], []],
  wall3: [[], []],
  wall4: [[], []],
};
const panelsDebugFolders = (() => {
  const panelsFolder = base.addDebugFolder("panels");
  const panelsWall1 = base.addDebugFolder("wall 1 panels", panelsFolder);
  const panelsWall1Lower = base.addDebugFolder("lower", panelsWall1);
  const panelsWall1Upper = base.addDebugFolder("upper", panelsWall1);
  const panelsWall2 = base.addDebugFolder("wall 2 panels", panelsFolder);
  const panelsWall2Lower = base.addDebugFolder("lower", panelsWall2);
  const panelsWall2Upper = base.addDebugFolder("upper", panelsWall2);
  const panelsWall3 = base.addDebugFolder("wall 3 panels", panelsFolder);
  const panelsWall3Lower = base.addDebugFolder("lower", panelsWall3);
  const panelsWall3Upper = base.addDebugFolder("upper", panelsWall3);
  const panelsWall4 = base.addDebugFolder("wall 4 panels", panelsFolder);
  const panelsWall4Lower = base.addDebugFolder("lower", panelsWall4);
  const panelsWall4Upper = base.addDebugFolder("upper", panelsWall4);
  return {
    wall1: [panelsWall1Lower, panelsWall1Upper],
    wall2: [panelsWall2Lower, panelsWall2Upper],
    wall3: [panelsWall3Lower, panelsWall3Upper],
    wall4: [panelsWall4Lower, panelsWall4Upper],
  };
})();
for (let i = 0; i < 6; i++) {
  panels.wall1[1].push(
    base.addShape(
      "plane",
      {
        dimensions: [24, 18],
        pos: [93 - i * 37.3, 37.5, 114.6],
        rotation: [0, -Math.PI, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall1[1] }
    )
  );
  panels.wall1[0].push(
    base.addShape(
      "plane",
      {
        dimensions: [24, 18],
        pos: [93 - i * 37.3, 12.6, 114.6],
        rotation: [0, -Math.PI, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall1[0] }
    )
  );

  panels.wall2[1].push(
    base.addShape(
      "plane",
      {
        dimensions: [24, 18],
        pos: [-93.3 + i * 37.4, 37.5, -114.6],
        rotation: [0, 0, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall2[1] }
    )
  );
  panels.wall2[0].push(
    base.addShape(
      "plane",
      {
        dimensions: [24, 18],
        pos: [-93.3 + i * 37.4, 12.6, -114.6],
        rotation: [0, 0, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall2[0] }
    )
  );

  panels.wall3[1].push(
    base.addShape(
      "plane",
      {
        dimensions: [24, 18],
        pos: [114.6, 37.4, 93.3 - i * 37.4],
        rotation: [0, -Math.PI / 2, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall3[1] }
    )
  );
  panels.wall3[0].push(
    base.addShape(
      "plane",
      {
        dimensions: [24, 18],
        pos: [114.6, 12.6, 93.3 - i * 37.4],
        rotation: [0, -Math.PI / 2, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall3[0] }
    )
  );

  panels.wall4[1].push(
    base.addShape(
      "plane",
      {
        dimensions: [24, 18],
        pos: [-114.6, 37.4, -93.7 + i * 37.5],
        rotation: [0, +Math.PI / 2, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall4[1] }
    )
  );
  panels.wall4[0].push(
    base.addShape(
      "plane",
      {
        dimensions: [24, 18],
        pos: [-114.6, 12.6, -93.7 + i * 37.5],
        rotation: [0, +Math.PI / 2, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall4[0] }
    )
  );
}

// END Create Photo Panels

base.skybox([
  "./resources/skyboxes/skybox_px.jpg",
  "./resources/skyboxes/skybox_nx.jpg",
  "./resources/skyboxes/skybox_py.jpg",
  "./resources/skyboxes/skybox_ny.jpg",
  "./resources/skyboxes/skybox_pz.jpg",
  "./resources/skyboxes/skybox_nz.jpg",
]);

// Create MC | Bind Camera
const model = base.loadAnimatedFBXModel({
  CharacterController,
  path: "./resources/peasant/",
  character: "peasant_girl.fbx",
  size: 0.1,
  pos: [-10, 0, -10],
});
const tppcam = base.lockTPPCamera(model);
// base.addCamera();

// END Create MC | Bind Camera

// base.loadGLTFModel(
//   "./resources/static_models/camera/Camera_01_1k.gltf",
//   [30, 15, 30],
//   40,
//   {
//     debugName: "GLTFCamera",
//   }
// );
// const table = base.loadGLTFModel(
//   "./resources/static_models/table_01/ClassicConsole_01_1k.gltf",
//   [0, 0, -35],
//   15,
//   {
//     debugName: "GLTFTable",
//   }
// );
// Create Chandeliers
const lanternsFolder = base.addDebugFolder("lanterns");
const makeLanterChandelier01 = (x, z, intensity = 50, color = 0xffffff) => {
  const folder = base.addDebugFolder(`lantern (${x}, ${z})`, lanternsFolder);
  const model = base.loadGLTFModel(
    "./resources/static_models/lantern_chandelier_02/lantern_chandelier_01_1k.glb",
    [x, 49, z],
    20,
    {
      debugFolder: folder,
      debugName: "gltfmodel",
    }
  );
  const pointLight = base.addPointLight(
    {
      color: 0xffffff,
      intensity: 50,
      decay: 1,
      pos: [x, 38.5, z],
      shadow: false,
    },
    {
      debugFolder: folder,
      debugName: "pointLight",
    }
  );

  return [model, pointLight];
};
const lanternChanRadius = 50;
let lantern1 = makeLanterChandelier01(lanternChanRadius, lanternChanRadius);
let lantern2 = makeLanterChandelier01(lanternChanRadius, -lanternChanRadius);
let lantern3 = makeLanterChandelier01(-lanternChanRadius, lanternChanRadius);
let lantern4 = makeLanterChandelier01(-lanternChanRadius, -lanternChanRadius);

// END Create Chandeliers

document.addEventListener(
  "keydown",
  (e) => {
    if (e.key == "f") {
      base.frameRateDisplay();
    }
  },
  false
);
