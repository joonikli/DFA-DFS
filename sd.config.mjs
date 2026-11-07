import StyleDictionary from 'style-dictionary';

// Figma exports colors as { colorSpace, components, alpha, hex }.
// Convert that object into a CSS color string.
StyleDictionary.registerTransform({
  name: 'color/figma-to-css',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'color' && typeof token.$value === 'object',
  transform: (token) => {
    const { hex, components, alpha = 1 } = token.$value;
    if (alpha === 1 && hex) return hex.toLowerCase();
    const [r, g, b] = components.map((c) => Math.round(c * 255));
    return `rgb(${r} ${g} ${b} / ${+alpha.toFixed(3)})`;
  },
});

const sd = new StyleDictionary({
  source: ['Variable collection/**/*.tokens.json'],
  usesDtcg: true,
  platforms: {
    css: {
      transforms: ['attribute/cti', 'name/kebab', 'color/figma-to-css'],
      buildPath: 'src/tokens/',
      files: [{ destination: 'tokens.css', format: 'css/variables' }],
    },
    js: {
      transforms: ['attribute/cti', 'name/camel', 'color/figma-to-css'],
      buildPath: 'src/tokens/',
      files: [{ destination: 'tokens.js', format: 'javascript/es6' }],
    },
  },
});

await sd.buildAllPlatforms();
