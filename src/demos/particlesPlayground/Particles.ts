// @ts-nocheck
import * as THREE from "three";

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
  constructor({ position, size, color, velocity, speed, lifeSpan, trail = 0 }) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
    this.color = color;
    this.speed = speed;

    this.trail = trail;

    this.lifeSpan = lifeSpan;
    this.alive = true;
    this.age = 0;
  }

  update(deltaT) {
    const v = new THREE.Vector3().copy(this.velocity);
    v.multiplyScalar(deltaT * this.speed);
    this.position.add(v);

    this.age += deltaT;

    // console.log(this.age)

    if (this.age >= this.lifeSpan) {
      this.alive = false;
    }
  }
}

class Particles {
  constructor(scene) {
    this.scene = scene;

    this.particles = [];

    // this.uniforms;

    this.geometry = new THREE.BufferGeometry();
    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: true,
      transparent: true,
      vertexColors: true,
    });

    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([], 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute([], 3)
    );
    this.geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute([], 1).setUsage(THREE.DynamicDrawUsage)
    );

    this.points = new THREE.Points(this.geometry, this.shaderMaterial);
    this.scene.add(this.points);
  }

  generate(amount = 50) {
    for (let i = 0; i < amount; i++) {
      const particle = new Particle({
        position: new THREE.Vector3(0, 0, 0),
        size: 100,
        color: new THREE.Color(0xff0000),
        velocity: new THREE.Vector3(0.2, 0.2, -1),
        speed: 50,
        lifeSpan: 1,
        trail: 50,
      });

      this.particles.push(particle);
    }
  }

  update(deltaT) {
    const positions = [];
    const colors = [];
    const sizes = [];

    this.particles = this.particles.filter(
      (particle) => particle.alive === true
    );

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      particle.update(deltaT);

      for (let j = 0; j < particle.trail; j++) {
        positions.push(
          particle.position.x - particle.velocity.x * (j / particle.trail),
          particle.position.y - particle.velocity.y * (j / particle.trail),
          particle.position.z - particle.velocity.z * (j / particle.trail)
        );
        colors.push(particle.color.r, particle.color.g, particle.color.b);
        sizes.push(particle.size);
      }
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
  }
}

export default Particles;
