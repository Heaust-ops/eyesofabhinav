import * as THREE from "three";

export default function prepareStandardMaterial({
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
      if (filters.mag.bumpMap) material.bumpMap.magFilter = filters.mag.bumpMap;
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
      if (filters.min.bumpMap) material.bumpMap.minFilter = filters.min.bumpMap;
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
