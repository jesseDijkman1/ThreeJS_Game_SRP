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

    this.parent = null;

    // this.uniforms;

    this.geometry = new THREE.BufferGeometry();
    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
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
    this.points.frustumCulled = false;
    this.scene.add(this.points);
  }

  create(position, velocity) {
    const particle = new Particle({
      position,
      size: 100,
      color: new THREE.Color(0xff0000),
      velocity,
      speed: 50,
      lifeSpan: 3,
      trail: 150,
    });

    this.particles.push(particle);
    return particle;
  }

  setParent(object) {
    this.parent = object;
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
          particle.position.x +
            particle.velocity.x * (j / (particle.trail / 5)),
          particle.position.y +
            particle.velocity.y * (j / (particle.trail / 5)),
          particle.position.z + particle.velocity.z * (j / (particle.trail / 5))
        );
        colors.push(particle.color.r, particle.color.g, particle.color.b);
        sizes.push(particle.size * (j / particle.trail));
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

    // if (this.parent) {
    //   this.points.applyMatrix4(this.parent.matrixWorld);
    // }
  }
}

export default Particles;
