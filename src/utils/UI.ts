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

class UI {
  constructor(root, state, visible = false) {
    this.root = root;
    this.state = state;

    this.visible = visible;
    this.components = [];

    this.addComponent(HitsComponent);
    this.addComponent(EffectOverlay);
    this.addComponent(HealthBar);
  }

  addComponent(_UIComponentClass) {
    this.components.push(new _UIComponentClass(this.root, this.state));
  }

  update() {}

  show() {}

  hide() {}
}

export default UI;
