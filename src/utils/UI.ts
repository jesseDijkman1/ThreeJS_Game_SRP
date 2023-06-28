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

class UI {
  constructor(root, state, visible = false) {
    this.root = root;
    this.state = state;

    this.visible = visible;
    this.components = [];

    this.addComponent(HitsComponent);
  }

  addComponent(_UIComponentClass) {
    this.components.push(new _UIComponentClass(this.root, this.state));
  }

  update() {}

  show() {}

  hide() {}
}

export default UI;
