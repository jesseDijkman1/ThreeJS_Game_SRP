import * as THREE from "three";

const colorRange = (
  colorStops: THREE.Color[],
  steps: number = 3
): THREE.Color[] => {
  const colors: THREE.Color[] = [];

  for (let i = 0; i < colorStops.length; i++) {
    if (i === colorStops.length - 1) {
      colors.push(new THREE.Color().copy(colorStops[colorStops.length - 1]));
      break;
    }
    for (let j = 0; j < steps; j++) {
      const color = new THREE.Color()
        .copy(colorStops[i])
        .lerp(colorStops[i + 1], j / steps);
      colors.push(color);
    }
  }

  return colors;
};

export default colorRange;
