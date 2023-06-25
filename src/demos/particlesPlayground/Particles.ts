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

    gl_PointSize = size * ( 3.0 / -mvPosition.z );

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D pointTexture;

  varying vec3 vColor;
  varying vec2 uv;
  varying vec2 cUV;
  varying vec4 color;
  varying vec3 originalColor;
  varying float disc;

  void main() {
    vec2 uv = vec2(gl_PointCoord.x,1. - gl_PointCoord.y);
    vec2 cUV = 2.*uv - 1.;

    vec3 originalColor = vec3(250./255.,1./255.,1./255.);

    vec4 color = vec4(0.18/length(cUV));

    color.rgb *= originalColor*30.;

    float disc = length(cUV);
      
    gl_FragColor = vec4(color.rgb,color.a - disc);
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

    // this.uniforms;

    this.geometry = new THREE.BufferGeometry();
    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: {
          value: new THREE.TextureLoader().load("assets/spark.png"),
        },
      },
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: true,
      transparent: true,
      vertexColors: true,
    });
  }

  generate(amount = 50) {
    for (let i = 0; i < amount; i++) {
      const particle = new Particle({
        position: new THREE.Vector3(0, 0, i / (amount / 3)),
        size: 100,
        color: new THREE.Color(0xff0000),
        velocity: new THREE.Vector3(0, 0, -1),
        speed: 50,
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

    this.points = new THREE.Points(this.geometry, this.shaderMaterial);
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
