import * as THREE from "three";

export default function prepareGeometry(
  shape,
  dimensions,
  segments,
  duplicateUV = false
) {
  /** Creating Geometry */
  let dim;
  let seg;
  let geometry;
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

  if (duplicateUV) {
    const uv1Array = geometry.getAttribute("uv").array;
    geometry.setAttribute("uv2", new THREE.BufferAttribute(uv1Array, 2));
  }

  return geometry;
}
