import Base from "./lib/base";
import CharacterController from "./lib/CharacterController";
import gsap from "gsap";

const debug = true;
if (debug) console.time("platform");

Array.prototype.swap = function (x, y) {
  var b = this[x];
  this[x] = this[y];
  this[y] = b;
  return this;
};

const base = new Base({
  ambientLight: window.innerWidth > 1000 ? 0xffffff : 0xffffff,
  customInitFunc: (parent) => {
    // Custom Init Function
    parent.enableAverageFrameRateCalculation = false;
    parent._renderer.shadowMap.enabled = false;
    parent._ambientLight.intensity = window.innerWidth > 1000 ? 1 : 2;
  },
  debug,
});
base.frameRateDisplay("toggle", "paused");
// Create Room

let floor = base.addShape(
  "Plane",
  {
    dimensions: [230, 230],
    segments: window.innerWidth > 1000 ? [200, 200] : [1, 1],
    duplicateUV: true,
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
    dimensions: [230, 230],
    pos: [0, 49, 0],
    segments: window.innerWidth > 1000 ? [50, 50] : [1, 1],
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
    displacementScale: 1.0,
    side: "back",
    repeat: [8, 8],
  },
  { debugName: "Roof" }
);

// Create Walls
const wallGeometry = base.prepareGeometry(
  "plane",
  [300, 50],
  window.innerWidth > 1000 ? [900, 30] : [1, 1]
);
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
const makeWall = (pos, rotation, debugName) => {
  return base.addShape(
    "Plane",
    {
      geometry: wallGeometry,
      pos,
      rotation,
      castShadow: false,
    },
    { material: wallTexture },
    { debugFolder: wallsFolder, debugName }
  );
};
if (debug) console.time("walls");
let wall1 = makeWall([0, 25, 115], [0, -Math.PI, 0], "wall1");
let wall2 = makeWall([0, 25, -115], [0, 0, 0], "wall2");
let wall3 = makeWall([115, 25, 0], [0, -Math.PI / 2, 0], "wall3");
let wall4 = makeWall([-115, 25, 0], [0, Math.PI / 2, 0], "wall4");
if (debug) console.timeEnd("walls");
// END Create Walls

// END Create Room

// Create Photo Panels



new Worker("worker.js");
window.postMessage(["get panel materials"]);
window.addEventListener("message", (e) => {
  if (e.data[0] === "panel textures") {
    console.log(e.data);


  }
});

if (debug) console.time("panels");
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
const panelGeometry = base.prepareGeometry("plane", [24, 18]);

for (let i = 0; i < 6; i++) {
  panels.wall1[1].push(
    base.addShape(
      "plane",
      {
        geometry: panelGeometry,
        pos: [93 - i * 37.3, 37.5, 114.6],
        rotation: [0, -Math.PI, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
        lightMapIntensity: 2.0,
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall1[1] }
    )
  );
  panels.wall1[0].push(
    base.addShape(
      "plane",
      {
        geometry: panelGeometry,
        pos: [93 - i * 37.3, 12.6, 114.6],
        rotation: [0, -Math.PI, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
        lightMapIntensity: 2.0,
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall1[0] }
    )
  );

  panels.wall2[1].push(
    base.addShape(
      "plane",
      {
        geometry: panelGeometry,
        pos: [-93.3 + i * 37.4, 37.5, -114.6],
        rotation: [0, 0, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
        lightMapIntensity: 2.0,
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall2[1] }
    )
  );
  panels.wall2[0].push(
    base.addShape(
      "plane",
      {
        geometry: panelGeometry,
        pos: [-93.3 + i * 37.4, 12.6, -114.6],
        rotation: [0, 0, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
        lightMapIntensity: 2.0,
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall2[0] }
    )
  );

  panels.wall3[1].push(
    base.addShape(
      "plane",
      {
        geometry: panelGeometry,
        pos: [114.6, 37.4, 93.3 - i * 37.4],
        rotation: [0, -Math.PI / 2, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
        lightMapIntensity: 2.0,
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall3[1] }
    )
  );
  panels.wall3[0].push(
    base.addShape(
      "plane",
      {
        geometry: panelGeometry,
        pos: [114.6, 12.6, 93.3 - i * 37.4],
        rotation: [0, -Math.PI / 2, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
        lightMapIntensity: 2.0,
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall3[0] }
    )
  );

  panels.wall4[1].push(
    base.addShape(
      "plane",
      {
        geometry: panelGeometry,
        pos: [-114.6, 37.4, -93.7 + i * 37.5],
        rotation: [0, +Math.PI / 2, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
        lightMapIntensity: 2.0,
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall4[1] }
    )
  );
  panels.wall4[0].push(
    base.addShape(
      "plane",
      {
        geometry: panelGeometry,
        pos: [-114.6, 12.6, -93.7 + i * 37.5],
        rotation: [0, +Math.PI / 2, 0],
        castShadow: false,
      },
      {
        map: "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
        lightMap: "./resources/textures/white_box.png",
        lightMapIntensity: 2.0,
      },
      { debugName: "panel" + (i + 1), debugFolder: panelsDebugFolders.wall4[0] }
    )
  );
}
if (debug) console.timeEnd("panels");
// END Create Photo Panels

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

// Create Chandeliers
const lanternsFolder = base.addDebugFolder("lanterns");
const makeLanterChandelier01 = async (
  x,
  z,
  intensity = 50,
  color = 0xffffff
) => {
  const folder = base.addDebugFolder(`lantern (${x}, ${z})`, lanternsFolder);
  const model = base.loadGLTFModel(
    "./resources/static_models/lantern_chandelier_01/lantern_chandelier_01_1k.glb",
    [x, 49, z],
    20,
    {
      debugFolder: folder,
      debugName: "gltfmodel",
    }
  );
  const pointLight =
    window.innerWidth > 1000
      ? base.addPointLight(
          {
            color: 0xffffff,
            intensity: 50,
            decay: 1,
            pos: [x, 27 /** 38.5 */, z],
            shadow: true,
          },
          {
            debugFolder: folder,
            debugName: "pointLight",
          }
        )
      : undefined;

  return [model, pointLight ? pointLight : undefined];
};
if (debug) console.time("lanterns");
const lanternChanRadius = 50;
let lantern1 = makeLanterChandelier01(lanternChanRadius, lanternChanRadius);
let lantern2 = makeLanterChandelier01(lanternChanRadius, -lanternChanRadius);
let lantern3 = makeLanterChandelier01(-lanternChanRadius, lanternChanRadius);
let lantern4 = makeLanterChandelier01(-lanternChanRadius, -lanternChanRadius);
if (debug) console.timeEnd("lanterns");
// END Create Chandeliers

let panelChanging = false;
const change_panel = (
  property,
  inAxis,
  axisSign,
  goingUpOrDown,
  duration = 1
) => {
  gsap.to(property, {
    keyframes: [
      {
        duration,
        [inAxis]:
          goingUpOrDown.toLowerCase() == "up"
            ? ~~`${axisSign}105`
            : ~~`${axisSign}95`,
      },
      {
        duration,
        y: goingUpOrDown.toLowerCase() == "up" ? 37.4 : 12.6,
      },
      {
        duration,
        [inAxis]: ~~`${axisSign}114.6`,
      },
    ],
  });
};

// Event Handling

document.addEventListener(
  "keydown",
  (e) => {
    if (e.key == "f") {
      base.frameRateDisplay("toggle", "paused");
    }
  },
  false
);

document.addEventListener(
  "keydown",
  async (e) => {
    if (e.key == "ArrowUp" && !panelChanging) {
      panelChanging = true;
      const duration = 3;
      // Swapping Panels
      // Wall 1
      panels.wall1[1].forEach((panel, i) => {
        change_panel(panel.position, "z", "+", "down");
      });
      panels.wall1[0].forEach((panel, i) => {
        change_panel(panel.position, "z", "+", "up");
      });
      panels.wall1.swap(0, 1);
      // Wall 2
      panels.wall2[1].forEach((panel, i) => {
        change_panel(panel.position, "z", "-", "down");
      });
      panels.wall2[0].forEach((panel, i) => {
        change_panel(panel.position, "z", "-", "up");
      });
      panels.wall2.swap(0, 1);
      await new Promise((r) => setTimeout(r, duration * 1000));
      // Wall 3
      panels.wall3[1].forEach((panel, i) => {
        change_panel(panel.position, "x", "+", "down");
      });
      panels.wall3[0].forEach((panel, i) => {
        change_panel(panel.position, "x", "+", "up");
      });
      panels.wall3.swap(0, 1);
      // Wall 4
      panels.wall4[1].forEach((panel, i) => {
        change_panel(panel.position, "x", "-", "down");
      });
      panels.wall4[0].forEach((panel, i) => {
        change_panel(panel.position, "x", "-", "up");
      });
      panels.wall4.swap(0, 1);
      await new Promise((r) => setTimeout(r, duration * 1000));
      panelChanging = false;
    }
  },
  false
);

if (debug) console.timeEnd("platform");
