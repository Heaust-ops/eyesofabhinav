import Base from "./lib/base";
import CharacterController from "./lib/CharacterController";
import gsap from "gsap";
// Font Awesome Imports
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import "@fortawesome/fontawesome-free/js/regular";
import "@fortawesome/fontawesome-free/js/brands";

const debug = true;
const mobileBreakPoint = 1000;

// Utils
const addToMag = (num, offset) => {
  return Math.sign(~~num) * (Math.abs(~~num) + offset);
};
Array.prototype.swap = function (x, y) {
  var b = this[x];
  this[x] = this[y];
  this[y] = b;
  return this;
};
// END Utils

// Fullscren Button For Mobile
if (window.innerWidth <= mobileBreakPoint) {
  document.body.innerHTML += `<div style="position: fixed; width: 100vw; height: 100vh; z-index: 2;" id="nipple-canvas"></div>`;

  const toggleFullscreen = (elem) => {
    elem = elem || document.documentElement;

    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  document.getElementById("mobile-fullscreen-container").style.display =
    "block";
  let isFullScreen = false;
  document.getElementById("fullscreen-button").onclick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isFullScreen) {
      document.getElementById("exit-fullscreen").style.display = "none";
      document.getElementById("fullscreen").style.display = "inline";
      toggleFullscreen();
      isFullScreen = !isFullScreen;
    } else {
      document.getElementById("exit-fullscreen").style.display = "inline";
      document.getElementById("fullscreen").style.display = "none";
      toggleFullscreen();
      isFullScreen = !isFullScreen;
    }
  };
}
// END Fullscren Button For Mobile

if (debug) console.time("platform");

const base = new Base({
  ambientLight: window.innerWidth > mobileBreakPoint ? 0xffffff : 0xffffff,
  customInitFunc: (parent) => {
    // Custom Init Function
    parent.enableAverageFrameRateCalculation = false;
    parent._renderer.shadowMap.enabled = false;
    parent._ambientLight.intensity =
      window.innerWidth > mobileBreakPoint ? 1 : 2;
  },
  debug,
});
base.frameRateDisplay("toggle", "paused");

// Create Room
const roomFolder = base.addDebugFolder("room");
let floor = base.addShape(
  "Plane",
  {
    dimensions: [230, 230],
    segments: window.innerWidth > mobileBreakPoint ? [200, 200] : [1, 1],
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
  { debugName: "Floor", debugFolder: roomFolder }
);

let roof = base.addShape(
  "Plane",
  {
    dimensions: [230, 230],
    pos: [0, 49, 0],
    segments: window.innerWidth > mobileBreakPoint ? [50, 50] : [1, 1],
  },
  {
    color: "#a48163",
    colorMultiply: true,
    texturesPath: "./resources/textures/aerial_asphalt_01",
    bumpMap: "./resources/textures/wall_noise/dst.jpg",
    bumpScale: 2.0,
    map: "jpg",
    aoMap: "jpg",
    displacementMap: "png",
    normalMap: "jpg",
    roughness: 0.2,
    roughnessMap: "jpg",
    displacementScale: 0.2,
    side: "back",
    repeat: [8, 8],
  },
  { debugName: "Roof", debugFolder: roomFolder }
);

// Create Walls
const wallGeometry = base.prepareGeometry(
  "plane",
  [300, 50],
  window.innerWidth > mobileBreakPoint ? [900, 30] : [1, 1]
);
const wallTexture = base.prepareStandardMaterial({
  color: "#d9aa82",
  colorMultiply: true,
  texturesPath: "./resources/textures/wood_wall_coffers_01",
  map: "./resources/textures/wall_noise/noise(7).jpg",
  roughness: 0.25,
});
const wallsFolder = base.addDebugFolder("walls", roomFolder);
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

let panelEdge = 114;
let panelLowerPos = 15.0;
let panelUpperPos = 37.4;

const addPanel = (
  spacing,
  frameSpacing,
  rotation,
  map,
  debugFolder,
  debugName,
  wallSide
) => {
  const pos = {
    "x:up": [panelEdge, panelUpperPos, spacing],
    "z:up": [spacing, panelUpperPos, panelEdge],
    "-x:up": [-panelEdge, panelUpperPos, spacing],
    "-z:up": [spacing, panelUpperPos, -panelEdge],
    "x:down": [panelEdge, panelLowerPos, spacing],
    "z:down": [spacing, panelLowerPos, panelEdge],
    "-x:down": [-panelEdge, panelLowerPos, spacing],
    "-z:down": [spacing, panelLowerPos, -panelEdge],
  }[wallSide];
  spacing = addToMag(spacing, -1.4);
  const frameElevationOffset = 10;
  const panelFrameEdge = addToMag(panelEdge, -2.8);
  const frameSpacingOffsetLocal = 2;
  const posFrame = {
    "x:up": [
      panelFrameEdge,
      panelUpperPos - frameElevationOffset,
      frameSpacing - frameSpacingOffsetLocal,
    ],
    "z:up": [
      frameSpacing - frameSpacingOffsetLocal,
      panelUpperPos - frameElevationOffset,
      panelFrameEdge,
    ],
    "-x:up": [
      -panelFrameEdge,
      panelUpperPos - frameElevationOffset,
      frameSpacing - frameSpacingOffsetLocal,
    ],
    "-z:up": [
      frameSpacing - frameSpacingOffsetLocal,
      panelUpperPos - frameElevationOffset,
      -panelFrameEdge,
    ],
    "x:down": [
      panelFrameEdge,
      panelLowerPos - frameElevationOffset,
      frameSpacing - frameSpacingOffsetLocal,
    ],
    "z:down": [
      frameSpacing - frameSpacingOffsetLocal,
      panelLowerPos - frameElevationOffset,
      panelFrameEdge,
    ],
    "-x:down": [
      -panelFrameEdge,
      panelLowerPos - frameElevationOffset,
      frameSpacing - frameSpacingOffsetLocal,
    ],
    "-z:down": [
      frameSpacing - frameSpacingOffsetLocal,
      panelLowerPos - frameElevationOffset,
      -panelFrameEdge,
    ],
  }[wallSide];
  const folder = base.addDebugFolder(debugName, debugFolder);
  const frame = base.loadGLTFModel(
    {
      modelPath: "./resources/static_models/picture-frame/picture frame.glb",
      pos: posFrame,
      rotation: [0, rotation[1] + (3 * Math.PI) / 2, 0],
      size: [0.5, 0.42, 0.5],
    },

    {
      debugName: "frame",
      debugFolder: folder,
    }
  );
  const panel = base.addShape(
    "plane",
    {
      geometry: panelGeometry,
      pos,
      rotation,
      castShadow: false,
    },
    {
      map,
      lightMap: "./resources/textures/white_box.png",
      lightMapIntensity: 2.0,
    },
    { debugName: "panel", debugFolder: folder }
  );
  return panel;
};
const spacingOffset = 37.4;
const frameSpacingOffset = 37.4;
for (let i = 0; i < 6; i++) {
  panels.wall1[1].push(
    addPanel(
      93 - i * spacingOffset,
      93 - i * frameSpacingOffset,
      [0, -Math.PI, 0],
      "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
      panelsDebugFolders.wall1[1],
      "panel" + (i + 1),
      "z:up"
    )
  );
  panels.wall1[0].push(
    addPanel(
      93 - i * spacingOffset,
      93 - i * frameSpacingOffset,
      [0, -Math.PI, 0],
      "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
      panelsDebugFolders.wall1[0],
      "panel" + (i + 1),
      "z:down"
    )
  );

  panels.wall2[1].push(
    addPanel(
      -93.3 + i * spacingOffset,
      -90.3 + i * frameSpacingOffset,
      [0, 0, 0],
      "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
      panelsDebugFolders.wall2[1],
      "panel" + (i + 1),
      "-z:up"
    )
  );
  panels.wall2[0].push(
    addPanel(
      -93.3 + i * spacingOffset,
      -90.3 + i * frameSpacingOffset,
      [0, 0, 0],
      "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
      panelsDebugFolders.wall2[0],
      "panel" + (i + 1),
      "-z:down"
    )
  );

  panels.wall3[1].push(
    addPanel(
      93.3 - i * spacingOffset,
      97.3 - i * frameSpacingOffset,
      [0, -Math.PI / 2, 0],
      "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
      panelsDebugFolders.wall3[1],
      "panel" + (i + 1),
      "x:up"
    )
  );
  panels.wall3[0].push(
    addPanel(
      93.3 - i * spacingOffset,
      97.3 - i * frameSpacingOffset,
      [0, -Math.PI / 2, 0],
      "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
      panelsDebugFolders.wall3[0],
      "panel" + (i + 1),
      "x:down"
    )
  );

  panels.wall4[1].push(
    addPanel(
      -93.7 + i * spacingOffset,
      -93.7 + i * frameSpacingOffset,
      [0, +Math.PI / 2, 0],
      "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
      panelsDebugFolders.wall4[1],
      "panel" + (i + 1),
      "-x:up"
    )
  );
  panels.wall4[0].push(
    addPanel(
      -93.7 + i * spacingOffset,
      -93.7 + i * frameSpacingOffset,
      [0, +Math.PI / 2, 0],
      "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832__480.jpg",
      panelsDebugFolders.wall4[0],
      "panel" + (i + 1),
      "-x:down"
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
const tppcam = base.lockTPPCamera(model, {
  far: 320,
  fov: window.innerWidth > mobileBreakPoint ? 60 : 80,
});
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
    {
      modelPath:
        "./resources/static_models/lantern_chandelier_01/lantern_chandelier_01_1k.glb",
      pos: [x, 49, z],
      size: 20,
    },
    {
      debugFolder: folder,
      debugName: "gltfmodel",
    }
  );
  const pointLight =
    window.innerWidth > mobileBreakPoint
      ? base.addPointLight(
          {
            color: 0xffffff,
            intensity: 20,
            decay: 1,
            pos: [x, 38.5 /** 27 */ /** 38.5 */, z],
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

// Change Panels
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
        y: goingUpOrDown.toLowerCase() == "up" ? panelUpperPos : panelLowerPos,
      },
      {
        duration,
        [inAxis]: ~~`${axisSign}${panelEdge}`,
      },
    ],
  });
};
// END Change Panels

// Area Lights
if (window.innerWidth > mobileBreakPoint) {
  if (debug) console.time("area lights");
  const rectAreaFolder = base.addDebugFolder("React Area Ligths");
  const rectAreaIntensity = 5;
  const reactAreaPlacementRadius = 115;
  const rectLight1 = base.addRectAreaLight(
    {
      width: 300,
      intensity: rectAreaIntensity,
      from: [28.25, 50.1, -reactAreaPlacementRadius],
      to: [28.25, 0, -reactAreaPlacementRadius],
    },
    {
      debugName: "Light -z",
      debugFolder: rectAreaFolder,
    }
  );
  const rectLight2 = base.addRectAreaLight(
    {
      width: 300,
      intensity: rectAreaIntensity,
      from: [28.25, 50.1, reactAreaPlacementRadius],
      to: [28.25, 0, reactAreaPlacementRadius],
    },
    {
      debugName: "Light +z",
      debugFolder: rectAreaFolder,
    }
  );
  const rectLight3 = base.addRectAreaLight(
    {
      width: 300,
      intensity: rectAreaIntensity,
      from: [0, 51.1, 0],
      to: [0, 0, 0],
    },
    {
      debugName: "Light +x",
      debugFolder: rectAreaFolder,
    }
  );
  rectLight3.rotation.z = Math.PI / 2;
  rectLight3.position.z = 28.25;
  rectLight3.position.x = reactAreaPlacementRadius;
  const rectLight4 = base.addRectAreaLight(
    {
      width: 300,
      intensity: rectAreaIntensity,
      from: [0, 51.1, 0],
      to: [0, 0, 0],
    },
    {
      debugName: "Light -x",
      debugFolder: rectAreaFolder,
    }
  );
  rectLight4.rotation.z = Math.PI / 2;
  rectLight4.position.z = 28.25;
  rectLight4.position.x = -reactAreaPlacementRadius;
  if (debug) console.timeEnd("area lights");
}
// END Area Lights

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

// END Event Handling

if (debug) console.timeEnd("platform");
