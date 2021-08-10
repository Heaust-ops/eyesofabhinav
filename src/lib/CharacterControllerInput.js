import nipplejs from "nipplejs";

class CharacterControllerProxy {
  constructor(animations) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
}

class CharacterControllerInput {
  constructor() {
    this._Init();
  }

  _Init() {
    if (window.innerWidth <= 1000) {


      // Nipple Joystick
      const options = {
        zone: document.getElementById('nipple-container'),
        threshold:0.2,
        color: "blue",
        dynamic: true,
      };
      let manager = nipplejs.create(options);
      manager.on("move", (e, data) => {
        if (data.raw.distance > 49) {
          this._keys.shift = true;
        } else {
          this._keys.shift = false;
        }
      });
      manager.on("plain:up", (e, data) => {
        this._keys.backward = false;
        this._keys.forward = true;
      });
      manager.on("plain:down", (e, data) => {
        this._keys.forward = false;
        this._keys.backward = true;
      });

      manager.on("dir:up dir:down", (e, data) => {
        this._keys.left = false;
        this._keys.right = false;
      });

      manager.on("dir:right", (e, data) => {
        this._keys.left = false;
        this._keys.right = true;
      });
      manager.on("dir:left", (e, data) => {
        this._keys.right = false;
        this._keys.left = true;
      });

      manager.on("end", (e, data) => {
        this._keys.forward = false;
        this._keys.backward = false;
        this._keys.left = false;
        this._keys.right = false;
      });
    }
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };
    document.addEventListener("keydown", (e) => this._onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this._onKeyUp(e), false);
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = true;
        break;
      case 65: // a
        this._keys.left = true;
        break;
      case 83: // s
        this._keys.backward = true;
        break;
      case 68: // d
        this._keys.right = true;
        break;
      case 32: // SPACE
        this._keys.space = true;
        break;
      case 16: // SHIFT
        this._keys.shift = true;
        break;
    }
  }

  _onKeyUp(event) {
    switch (event.keyCode) {
      case 87: // w
        this._keys.forward = false;
        break;
      case 65: // a
        this._keys.left = false;
        break;
      case 83: // s
        this._keys.backward = false;
        break;
      case 68: // d
        this._keys.right = false;
        break;
      case 32: // SPACE
        this._keys.space = false;
        break;
      case 16: // SHIFT
        this._keys.shift = false;
        break;
    }
  }
}

export default CharacterControllerInput;
