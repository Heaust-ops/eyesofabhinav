import * as dat from "dat.gui";
import gsap from "gsap";

export default class Debug {
  constructor(width = 600) {
    this._gui = new dat.GUI({ width });
  }

  get gui () {
    return this._gui;
  }

  addDebugFolder(name = "generic" + this.random(0, 10000), parent = this._gui) {
    if (this._debug) return parent.addFolder(name);
  }

  debugBasicMesh({
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
      return folder;
    }
  }
}
