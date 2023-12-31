// @ts-nocheck

import * as THREE from "three";

class InputState {
  _state: Record<string, any>;
  _changeListeners: Record<string, Array<() => void>>;
  _initListeners: Record<string, Array<() => void>>;
  _eventListeners: Record<string, Array<() => void>>;

  constructor(initialState = {}) {
    this._state = { ...initialState };
    this._changeListeners = {};
    this._initListeners = {};

    this._eventListeners = {};
  }

  initState(key: string, defaultValue: any) {
    this._state[key] = defaultValue;

    this.dispatchInitEvent(key);
  }

  getState(key?: string): any {
    return typeof key === "string" ? this._state[key] : this._state;
  }

  setState(key: string, value: any) {
    this._state[key] = value;

    this.dispatchChangeEvent(key);
  }

  dispatchChangeEvent(key: string) {
    (this._changeListeners[key] ?? []).forEach((cb) => {
      cb(this._state[key]);
    });
  }

  dispatchInitEvent(key: string) {
    (this._initListeners[key] ?? []).forEach((cb) => {
      cb(this._state[key]);
    });
  }

  onStateChange(key: string, cb: (arguments) => void) {
    this._changeListeners[key] = [cb, ...(this._changeListeners[key] ?? [])];
  }

  onStateInit(key: string, cb: () => void) {
    this._initListeners[key] = [cb, ...(this._initListeners[key] ?? [])];
  }

  on(event, callback) {
    this._eventListeners[event] = [
      callback,
      ...(this._eventListeners[event] ?? []),
    ];
  }

  dispatchEvent(event) {
    (this._eventListeners[event] ?? []).forEach((callback) => callback());
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
