import * as THREE from "three";
import { FiniteStateMachine } from "./FSM";
import CharacterControllerInput from "./CharacterControllerInput";
import {
  IdleState,
  WalkState,
  RunState,
  DanceState,
} from "./CharacterStateTemplates";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this._Init();
  }

  _Init() {
    this._AddState("idle", IdleState);
    this._AddState("walk", WalkState);
    this._AddState("run", RunState);
    this._AddState("dance", DanceState);
  }
}

class CharacterControllerProxy {
  constructor(animations) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
}

class CharacterController {
  constructor({
    camera,
    scene,
    path,
    character,
    walk,
    run,
    idle,
    dance,
    size,
    pos,
  } = {}) {
    this._Init({
      camera,
      scene,
      path,
      character,
      walk,
      run,
      idle,
      dance,
      size,
      pos,
    });
  }

  _Init(params) {
    this._params = params;
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new THREE.Vector3(1, window.innerWidth>1000?0.25:0.1, 100.0);
    this._velocity = new THREE.Vector3(0, 0, 0);
    this._position = new THREE.Vector3();
    this._boundary = 100;

    this._animations = {};
    this._input = new CharacterControllerInput();
    this._stateMachine = new CharacterFSM(
      new CharacterControllerProxy(this._animations)
    );

    this._LoadModels(this._params.pos);
  }

  get Position() {
    return this._position;
  }

  get Rotation() {
    if (!this._target) {
      return new THREE.Quaternion();
    }
    return this._target.quaternion;
  }

  _LoadModels(pos) {
    const loader = new FBXLoader();
    loader.setPath(this._params.path);
    loader.load(this._params.character, (fbx) => {
      fbx.scale.setScalar(this._params.size);
      fbx.traverse((c) => {
        c.castShadow = true;
      });

      fbx.position.copy(new THREE.Vector3(...pos));
      this._target = fbx;
      this._params.scene.add(this._target);

      this._mixer = new THREE.AnimationMixer(this._target);

      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        this._stateMachine.SetState("idle");
      };

      const _OnLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);

        this._animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader(this._manager);
      loader.setPath(this._params.path);
      loader.load(this._params.walk, (a) => {
        _OnLoad("walk", a);
      });
      loader.load(this._params.run, (a) => {
        _OnLoad("run", a);
      });
      loader.load(this._params.idle, (a) => {
        _OnLoad("idle", a);
      });
      loader.load(this._params.dance, (a) => {
        _OnLoad("dance", a);
      });
    });
  }

  Update(timeInSeconds) {
    if (!this._stateMachine._currentState) {
      return;
    }

    this._stateMachine.Update(timeInSeconds, this._input);

    const velocity = this._velocity;
    const frameDecceleration = new THREE.Vector3(
      velocity.x * this._decceleration.x,
      velocity.y * this._decceleration.y,
      velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z =
      Math.sign(frameDecceleration.z) *
      Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._target;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();
    if (this._input._keys.shift) {
      acc.multiplyScalar(2.0);
    }

    if (this._stateMachine._currentState.Name == "dance") {
      acc.multiplyScalar(0.0);
    }

    if (this._input._keys.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this._input._keys.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (this._input._keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(
        _A,
        4.0 * Math.PI * timeInSeconds * this._acceleration.y
      );
      _R.multiply(_Q);
    }
    if (this._input._keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(
        _A,
        4.0 * -Math.PI * timeInSeconds * this._acceleration.y
      );
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    //  Bound to Within Boundaries

    if (controlObject.position.x > this._boundary) {
      if (forward.x > 0) forward.setX(0);
      if (sideways.x > 0) sideways.setX(0);
    }
    if (controlObject.position.x < -this._boundary) {
      if (forward.x < 0) forward.setX(0);
      if (sideways.x < 0) sideways.setX(0);
    }
    if (controlObject.position.z > this._boundary) {
      if (forward.x > 0) forward.setZ(0);
      if (sideways.x > 0) sideways.setZ(0);
    }
    if (controlObject.position.z < -this._boundary) {
      if (forward.x < 0) forward.setZ(0);
      if (sideways.x < 0) sideways.setZ(0);
    }

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    // Fail Safe for boundaries (Jerky)
    if (controlObject.position.x > this._boundary + 1)
      controlObject.position.setX(this._boundary - 0.1);
    if (controlObject.position.x < -this._boundary - 1)
      controlObject.position.setX(-this._boundary + 0.1);
    if (controlObject.position.z > this._boundary + 1)
      controlObject.position.setZ(this._boundary - 0.1);
    if (controlObject.position.z < -this._boundary - 1)
      controlObject.position.setZ(-this._boundary + 0.1);

    this._position.copy(controlObject.position);

    if (this._mixer) {
      this._mixer.update(timeInSeconds);
    }
  }
}

export default CharacterController;
