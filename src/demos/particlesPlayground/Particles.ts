// @ts-nocheck
import * as THREE from "three";

const randomVector3 = () => {
  return new THREE.Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  );
};

const vertexShader = `
  attribute float size;

  varying vec3 vColor;

  void main() {
    vColor = color;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    gl_PointSize = size * ( 300.0 / -mvPosition.z );

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D pointTexture;

  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4( vColor, 1.0 );

    gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
  }
`;

class Particle {
  constructor({ position, size, color, velocity, speed }) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
    this.color = color;
    this.speed = speed;
  }

  update(deltaT) {
    const v = new THREE.Vector3().copy(this.velocity);
    v.multiplyScalar(deltaT * this.speed);
    this.position.add(v);
  }
}

class Particles {
  constructor(scene) {
    this.scene = scene;

    this.particles = [];

    this.uniforms = {
      pointTexture: {
        value: new THREE.TextureLoader().load("assets/spark.png"),
      },
    };

    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    // this.material = new THREE.ShaderMaterial({
    //   uniforms: this.uniforms,
    //   vertexShader,
    //   fragmentShader,
    //   blending: THREE.AdditiveBlending,
    //   depthTest: false,
    //   // transparent: true,
    //   vertexColors: true,
    // });
  }

  generate(amount = 50) {
    for (let i = 0; i < amount; i++) {
      const particle = new Particle({
        position: new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          0
        ),
        size: 20,
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
        velocity: new THREE.Vector3(0, 0, -1),
        speed: 10,
      });

      this.particles.push(particle);
    }
  }

  render() {
    const positions = [];
    const colors = [];
    const sizes = [];

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      positions.push(
        particle.position.x,
        particle.position.y,
        particle.position.z
      );
      colors.push(particle.color.r, particle.color.g, particle.color.b);
      sizes.push(particle.size);
    }

    // const color = new THREE.Color();

    // for (let i = 0; i < this.particlesAmount; i++) {
    //   positions.push((Math.random() * 2 - 1) * this.radius);
    //   positions.push((Math.random() * 2 - 1) * this.radius);
    //   positions.push((Math.random() * 2 - 1) * this.radius);

    //   color.setHSL(i / this.particlesAmount, 1.0, 0.5);

    //   colors.push(color.r, color.g, color.b);

    //   sizes.push(this.size);
    // }

    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );
    this.geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(sizes, 1).setUsage(
        THREE.DynamicDrawUsage
      )
    );

    this.points = new THREE.Line(this.geometry, this.shaderMaterial);
    this.scene.add(this.points);
  }

  update(deltaT) {
    const positions = [];
    const colors = [];
    const sizes = [];

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      particle.update(deltaT);

      positions.push(
        particle.position.x,
        particle.position.y,
        particle.position.z
      );
      colors.push(particle.color.r, particle.color.g, particle.color.b);
      sizes.push(particle.size);
    }

    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );
    this.geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(sizes, 1).setUsage(
        THREE.DynamicDrawUsage
      )
    );
    // const sizes = [];

    // if (this.size > this.maxSize) {
    //   this.targetSize = this.minSize;
    // } else if (this.size < this.minSize) {
    //   this.targetSize = this.maxSize;
    // }

    // this.size += deltaT * (this.size < this.targetSize ? 20 : -20);

    // console.log(this.size);

    // for (let i = 0; i < this.particlesAmount; i++) {
    //   sizes.push(this.size);
    // }

    // this.geometry.setAttribute(
    //   "size",
    //   new THREE.Float32BufferAttribute(sizes, 1).setUsage(
    //     THREE.DynamicDrawUsage
    //   )
    // );
  }
}

export default Particles;
