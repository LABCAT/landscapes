export const sketchMetadata = {
  'number-2': {
    title: '#LandscapesNo2',
    description: 'An exploration into generative trees.',
    sketch: 'LandscapesNo2.js',
  },
};

export function getAllSketches() {
  return Object.keys(sketchMetadata).map(id => ({
    id,
    ...sketchMetadata[id]
  }));
}

export function getSketchById(id) {
  return sketchMetadata[id] || null;
}
