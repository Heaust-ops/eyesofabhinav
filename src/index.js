import Base from "./lib/base";
import CharacterController from "./lib/CharacterController";
import gsap from "gsap";
// Font Awesome Imports
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import "@fortawesome/fontawesome-free/js/regular";
import "@fortawesome/fontawesome-free/js/brands";

const debug = false;
const mobileBreakPoint = 1000;
const pi = Math.PI;
let i;
let ndcMouseX = -1;
let ndcMouseY = -1;

// Utils
const sliceIntoChunks = (arr, chunkSize) => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
};

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
      window.innerWidth > mobileBreakPoint ? 2 : 5;
  },
  debug: false,
});
// base.frameRateDisplay("toggle", "paused");

const apidict = {
  photo1: "/resources/images/001.jpg",
  photo2: "/resources/images/002.jpg",
  photo3: "/resources/images/003.jpg",
  photo4: "/resources/images/004.jpg",
  photo5: "/resources/images/005.jpg",
  //
  photo6: "/resources/images/006.jpg",
  photo7: "/resources/images/007.jpg",
  photo8: "/resources/images/008.jpg",
  photo9: "/resources/images/009.jpg",
  photo10: "/resources/images/010.jpg",
  //
  photo11: "/resources/images/011.jpg",
  photo12: "/resources/images/012.jpg",
  photo13: "/resources/images/013.jpg",
  photo14: "/resources/images/014.jpg",
  photo15: "/resources/images/015.jpg",
  //
  photo16: "/resources/images/016.jpg",
  photo17: "/resources/images/017.jpg",
  photo18: "/resources/images/018.jpg",
  photo19: "/resources/images/019.jpg",
  photo20: "/resources/images/020.jpg",
};

// Create Room
window.innerWidth > mobileBreakPoint
  ? base.loadGLTFModel({
      modelPath: "./resources/static_models/gallery/gal.glb",
      size: 12,
    })
  : base.loadGLTFModel({
      modelPath: "./resources/static_models/gallery/gal.glb",
      size: 12,
      removeObjSubstr: "oint",
    });

// END Create Room

// Create Photo Panels

if (debug) console.time("panels");
let panels = [];
const panelsDebugFolders = (() => {
  const panelsFolder = base.addDebugFolder("panels");
  const panelsWall1 = base.addDebugFolder("wall 1 panels", panelsFolder);
  const panelsWall2 = base.addDebugFolder("wall 2 panels", panelsFolder);
  const panelsWall3 = base.addDebugFolder("wall 3 panels", panelsFolder);
  const panelsWall4 = base.addDebugFolder("wall 4 panels", panelsFolder);
  return {
    wall1: panelsWall1,
    wall2: panelsWall2,
    wall3: panelsWall3,
    wall4: panelsWall4,
  };
})();
const panelGeometry = base.prepareGeometry("plane", [28.2, 28.2], [1, 1]);
const addPanel = (
  startXZ,
  spacingXZ,
  photo,
  n,
  rotation,
  debugFolder,
  offsetXZ = [0, 0]
) => {
  const panel = base.addShape(
    "plane",
    {
      geometry: panelGeometry,
      pos: [
        startXZ[0] + n * spacingXZ[0] + offsetXZ[0],
        21.75,
        startXZ[1] + n * spacingXZ[1] + offsetXZ[1],
      ],
      rotation: [0, rotation, 0],
    },
    {
      map: photo,
      normalMap: "./resources/textures/wrinkle.jpg",
      normalScale: [5, 5],
      aoMap: "./resources/textures/wrinkleao.jpg",
      lightMap: "./resources/textures/white_box.png",
      lightMapIntensity: 0.0,
    },
    { debugFolder, debugName: `panel${n}` }
  );

  panels.push(panel);
};

const apidictkeys = sliceIntoChunks(Object.keys(apidict), 5);
// Wall 1
for (i = 0; i < 5; i++) {
  addPanel(
    [78.8, 114.3],
    [-41, 0],
    apidict[apidictkeys[0][i]],
    i,
    pi,
    panelsDebugFolders.wall1
  );
}

// Wall 2
for (i = 0; i < 5; i++) {
  addPanel(
    [115.32, -79.5],
    [0, 41],
    apidict[apidictkeys[1][i]],
    i,
    -pi / 2,
    panelsDebugFolders.wall2
  );
}

// Wall 3
for (i = 0; i < 5; i++) {
  addPanel(
    [81.2, -114.75],
    [-41, 0],
    apidict[apidictkeys[2][i]],
    i,
    0,
    panelsDebugFolders.wall3
  );
}

// Wall 4
for (i = 0; i < 5; i++) {
  addPanel(
    [-115, -82.13],
    [0, 41],
    apidict[apidictkeys[3][i]],
    i,
    pi / 2,
    panelsDebugFolders.wall4
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

// Panel Viewing Logic

if (window.innerWidth > mobileBreakPoint) {
  let allPanels = panels;
  let deIlluminationQueue = [];
  const deIlluminatePanels = () => {
    while (deIlluminationQueue.length > 0) {
      gsap.to(deIlluminationQueue.pop(), {
        duration: 0.35,
        lightMapIntensity: 0.0,
      });
    }
  };
  let rc = base.raycaster;

  const changeCursorOnPanels = () => {
    rc.setFromCamera(base.getVector3(ndcMouseX, ndcMouseY, 0), base.camera);
    let intersects = rc.intersectObjects(allPanels);
    let cursorStyle = document.body.style.cursor;
    if (intersects.length > 0) {
      if (cursorStyle != "pointer") document.body.style.cursor = "pointer";
      deIlluminationQueue.push(intersects[0].object.material);
      gsap.to(intersects[0].object.material, {
        duration: 0.35,
        lightMapIntensity: 3.0,
      });
    } else {
      if (cursorStyle != "auto") document.body.style.cursor = "auto";
      deIlluminatePanels();
    }
  };

  let changeCursorOnPanelsInterval = setInterval(changeCursorOnPanels, 100);

  const imageView = document.getElementById("image-view");
  const imageViewCloseButton = document.getElementById(
    "image-view-close-container"
  );
  const changePanelOnClick = async () => {
    rc.setFromCamera(base.getVector3(ndcMouseX, ndcMouseY, 0), base.camera);
    let intersects = rc.intersectObjects(allPanels);
    if (intersects.length > 0) {
      clearInterval(changeCursorOnPanelsInterval);
      document.body.style.cursor = "auto";
      imageView.style.backgroundImage = `url(${intersects[0].object.material.map.image.src})`;
      imageView.style.display = "block";
      imageViewCloseButton.style.display = "block";
      await new Promise((r) => setTimeout(r, 10));
      imageView.style.opacity = 1;
      imageViewCloseButton.style.opacity = 1;
      deIlluminatePanels();
    }
  };
  imageViewCloseButton.onclick = async (e) => {
    imageView.style.opacity = 0;
    imageViewCloseButton.style.opacity = 0;
    await new Promise((r) => setTimeout(r, 1000));
    imageView.style.display = "none";
    imageViewCloseButton.style.display = "none";
    changeCursorOnPanelsInterval = setInterval(changeCursorOnPanels, 100);
  };
  // Events
  document.addEventListener("mousedown", changePanelOnClick);
  document.addEventListener("mousemove", (e) => {
    ndcMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    ndcMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

// END Panel viewing Logic

// Event Handling

document.addEventListener(
  "keydown",
  (e) => {
    switch (e.key) {
      // case "f":
      //   base.frameRateDisplay("toggle", "paused");
      //   break;
      case "ArrowUp":
        tppcam.fov += 1;
        tppcam.updateProjectionMatrix();
        break;
      case "ArrowDown":
        tppcam.fov -= 1;
        tppcam.updateProjectionMatrix();
        break;
    }
  },
  false
);

// END Event Handling

if (debug) console.timeEnd("platform");
