// @ts-nocheck

import * as THREE from "three";

class InputState {
  _state: Record<string, any>;
  _listeners: Record<string, Array<() => void>>;

  constructor(initialState = {}) {
    this._state = { ...initialState };
    this._listeners = {};
  }

  getState(key?: string): any {
    return typeof key === "string" ? this._state[key] : this._state;
  }

  setState(key: string, value: any) {
    this._state[key] = value;

    // console.log("OIJ", key, this._state);

    this.dispatchChangeEvent(key);
  }

  dispatchChangeEvent(key: string) {
    (this._listeners[key] ?? []).forEach((cb) => {
      cb(this._state[key]);
    });
  }

  onStateChange(key: string, cb: () => void) {
    console.log(key, this);
    this._listeners[key] = [cb, ...(this._listeners[key] ?? [])];
  }
}

class InputController {
  state: InputState;

  constructor(state) {
    this.state = state;

    this.init();
  }

  init() {
    document.body.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyW":
          this.state.setState("tiltDown", true);
          break;
        case "KeyD":
          this.state.setState("rotateRight", true);
          break;
        case "KeyS":
          this.state.setState("tiltUp", true);
          break;
        case "KeyA":
          this.state.setState("rotateLeft", true);
          break;
        case "ShiftLeft":
          this.state.setState("boost", true);
          break;
        case "Space":
          this.state.setState("shooting", true);
          break;
      }
    });

    document.body.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "KeyW":
          this.state.setState("tiltDown", false);
          break;
        case "KeyD":
          this.state.setState("rotateRight", false);
          break;
        case "KeyS":
          this.state.setState("tiltUp", false);
          break;
        case "KeyA":
          this.state.setState("rotateLeft", false);
          break;
        case "ShiftLeft":
          this.state.setState("boost", false);
          break;
        case "Space":
          this.state.setState("shooting", false);
          break;
      }
    });
  }
}

export { InputController, InputState };
