// @ts-nocheck

class UIComponent {
  constructor(name, root, state) {
    this.name = name;
    this.root = root;
    this.state = state;

    this.elements = {};
  }

  registerElement(name, query) {
    this.elements[name] = this.root.querySelector(query);
  }
}

class HitsComponent extends UIComponent {
  constructor(root, state) {
    super("hits", root, state);

    this.init();
  }

  init() {
    this.registerElement("count", ".hits__count");
    // this.registerElement("total", ".hits__total");

    this.state.onStateInit(
      "asteroids:destroyed",
      this.updateCounter.bind(this)
    );

    this.state.onStateChange(
      "asteroids:destroyed",
      this.updateCounter.bind(this)
    );
  }

  updateCounter(n: number) {
    console.log("O", this);
    this.elements.count.textContent = n;
  }
}

class EffectOverlay extends UIComponent {
  constructor(root, state) {
    super("effect_overlay", root, state);

    this.init();
  }

  init() {
    this.registerElement("overlay", ".effect-overlay");

    this.state.onStateChange("spaceship:health", this.displayEffect.bind(this));
  }

  displayEffect() {
    console.log("oi");
    this.elements.overlay.classList.remove("active");
    this.elements.overlay.offsetHeight; // Repaint
    this.elements.overlay.classList.add("active");
  }
}

class HealthBar extends UIComponent {
  constructor(root, state) {
    super("healthbar", root, state);

    this.init();
  }

  init() {
    this.registerElement("container", ".health__bar");

    this.state.onStateInit("spaceship:health", this.initHealthBar.bind(this));

    this.state.onStateChange(
      "spaceship:health",
      this.updateHealthBar.bind(this)
    );
  }

  initHealthBar(lifes) {
    const spans = new Array(lifes).fill("null").map((_, i) => {
      const el = document.createElement("SPAN");
      el.style.setProperty("--life", i);
      return el;
    });

    this.elements.container.append(...spans);
    this.root.style.setProperty("--total-lifes", lifes);
  }

  updateHealthBar(lifes) {
    this.root.style.setProperty("--total-lifes", lifes);
  }
}

class Options extends UIComponent {
  constructor(root, state) {
    super("options", root, state);

    this.init();
  }

  init() {
    this.registerElement("container", ".ui-component--options");
    this.registerElement("loader", ".ui__loader");
    this.registerElement("startButton", ".ui__button--start");
    this.registerElement("continueButton", ".ui__button--continue");
    this.registerElement("restartButton", ".ui__button--restart");

    this.state.onStateChange("game:loop", this.handleGameLoopChange.bind(this));

    this.elements.startButton.addEventListener("click", (e) => {
      this.state.setState("ui", "visible");
      this.state.setState("game:loop", "running");
    });

    this.elements.continueButton.addEventListener("click", (e) => {
      this.state.setState("game:loop", "running");
    });

    this.elements.restartButton.addEventListener("click", (e) => {
      // this.state.setState("game:loop", "running");
      window.location.reload();
    });

    window.addEventListener("keydown", (e) => {
      if (e.code !== "Escape") return;

      const gameState = this.state.getState("game:loop");

      if (gameState === "running") {
        this.state.setState("game:loop", "paused");
      } else {
        this.state.setState("game:loop", "running");
      }
    });
  }

  handleGameLoopChange(gameLoopState) {
    switch (gameLoopState) {
      case "ready":
        this.elements.loader.hidden = true;
        this.elements.startButton.hidden = false;
        break;
      case "running":
        this.elements.container.hidden = true;
        this.elements.startButton.hidden = true;
        break;
      case "paused":
        this.elements.container.hidden = false;
        this.elements.continueButton.hidden = false;
        break;
      case "ended":
        this.elements.container.hidden = false;
        this.elements.restartButton.hidden = false;
        break;
      default:
        break;
    }
  }

  handleContinue() {}

  handleRestart() {}
}

class UI {
  constructor(root, state, visible = false) {
    this.root = root;
    this.state = state;

    this.visible = visible;
    this.components = [];

    this.header = root.querySelector(".ui__header");

    this.addComponent(HitsComponent);
    this.addComponent(EffectOverlay);
    this.addComponent(HealthBar);
    this.addComponent(Options);

    this.init();
  }

  addComponent(_UIComponentClass) {
    this.components.push(new _UIComponentClass(this.root, this.state));
  }

  update() {}

  show() {}

  hide() {}

  init() {
    this.state.onStateChange("game:loop", (state) => {
      switch (state) {
        case "running":
          this.header.classList.add("show");
          break;
        case "paused":
        case "ended":
          this.header.classList.remove("show");
      }
    });
  }
}

export default UI;
