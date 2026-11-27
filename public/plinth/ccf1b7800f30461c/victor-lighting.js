// Center and illuminated half-length of the glass sign on the espresso wall.
export const neonLight={x:6.93,y:17.43,z:4.43,halfLength:1.52};

// Lighting response of authored architectural surfaces, independent of the camera.
export function roomLightClass(name) {
  if (/^CE_neon_(glass|core)$/i.test(name)) return 4;
  if (/counter spotlight diffuser/i.test(name)) return 6;
  if (/lit opal glass|lower glass diffuser|warm layered opal|espresso pilot/i.test(name)) return 3;
  if (/CE_window (amber|linen)/i.test(name)) return 2;
  if (/reeded glass|wire reflections/i.test(name)) return 5;
  if (/^CE_(street |sky |distant roofs|bluegrey stone|hazy silvery limestone|mauve stone)/i.test(name)) return 1;
  return 0;
}
