const images = [
  { identifier: 'ai-generated-lady', fileName: 'ai-generated-lady.jpg' },
  {
    identifier: 'ai-generated-snow-leopard',
    fileName: 'ai-generated-snow-leopard.png',
  },
  {
    identifier: 'ai-generated-luxury-hotel',
    fileName: 'ai-generated-luxury-hotel.jpg',
  },
  { identifier: 'ai-generated-caver', fileName: 'ai-generated-caver.jpg' },
  { identifier: 'hinduism', fileName: 'hinduism.jpg' },
  { identifier: 'people', fileName: 'people.jpg' },
  {
    identifier: 'elbphilharmonie-concert-hall',
    fileName: 'elbphilharmonie-concert-hall.jpg',
  },
  {
    identifier: 'chair-by-window',
    fileName: 'chair-by-window.jpg',
  },
  {
    identifier: 'mountain',
    fileName: 'mountain.jpg',
  },
  {
    identifier: 'drinking-glasses',
    fileName: 'drinking-glasses.jpg',
  },
  {
    identifier: 'tree',
    fileName: 'tree.jpg',
  },
  {
    identifier: 'apples',
    fileName: 'apples.jpg',
  },
  {
    identifier: 'industrial-reflection',
    fileName: 'industrial-reflection.jpg',
  },
  {
    identifier: 'bird-resting-on-building',
    fileName: 'bird-resting-on-building.jpg',
  },
  {
    identifier: 'grass',
    fileName: 'grass.jpg',
  },
  {
    identifier: 'paper-boat',
    fileName: 'paper-boat.jpg',
  },
  {
    identifier: 'tulips',
    fileName: 'tulips.jpg',
  },
  {
    identifier: 'sand-next-to-water',
    fileName: 'sand-next-to-water.jpg',
  },
  {
    identifier: 'interior-decoration-variety',
    fileName: 'interior-decoration-variety.jpg',
  },
  {
    identifier: 'boat-by-mountain-forests',
    fileName: 'boat-by-mountain-forests.jpg',
  },
  {
    identifier: 'driving-dirt-road',
    fileName: 'driving-dirt-road.jpg',
  },
  {
    identifier: 'mallard-duck',
    fileName: 'mallard-duck.jpg',
  },
  {
    identifier: 'autumn-leaves',
    fileName: 'autumn-leaves.jpg',
  },
  {
    identifier: 'big-pipes-side-of-building',
    fileName: 'big-pipes-side-of-building.jpg',
  },
  {
    identifier: 'negative-castle',
    fileName: 'negative-castle.jpg',
  },
  {
    identifier: 'sunflowers',
    fileName: 'sunflowers.jpg',
  },
  { identifier: 'goat', fileName: 'goat.jpg' },
  { identifier: 'dandelion', fileName: 'dandelion.jpg' },
  {
    identifier: 'picnic',
    fileName: 'picnic.jpg',
  },
  {
    identifier: 'las-setas-de-sevilla',
    fileName: 'las-setas-de-sevilla.jpg',
  },
  {
    identifier: 'highway-tree-mountain-rainbow',
    fileName: 'highway-tree-mountain-rainbow.jpg',
  },
  {
    identifier: 'hot-air-balloon',
    fileName: 'hot-air-balloon.jpg',
  },
  {
    identifier: 'vase-flowers',
    fileName: 'vase-flowers.jpg',
  },
  { identifier: 'adult-child-stairs', fileName: 'adult-child-stairs.jpg' },
  {
    identifier: 'charles-v-circular-courtyard',
    fileName: 'charles-v-circular-courtyard.jpg',
  },
  { identifier: 'raindrop-leaf', fileName: 'raindrop-leaf.jpg' },
  { identifier: 'white-sand', fileName: 'white-sand.jpg' },
  { identifier: 'sea-ship-wreck', fileName: 'sea-ship-wreck.jpg' },
  { identifier: 'squirrel', fileName: 'squirrel.jpg' },
  { identifier: 'starry-sky', fileName: 'starry-sky.jpg' },
];

const MoreCount = 11;

// Prefixing with "NextBatch" because ImageData seems to be a reserved type.
export type NextBatchImageData = string;

export function getNextBatch(afterToken: number | undefined = 0): Promise<{
  data: Array<NextBatchImageData>;
  afterToken: number | null;
}> {
  const toReturn = images.slice(afterToken, afterToken + MoreCount);
  afterToken += MoreCount;
  return new Promise(async (res) => {
    await new Promise((res) => setTimeout(res, 0.5 * 1000));
    res({
      data: toReturn.map(({ fileName }) => `/assets/${fileName}`),
      afterToken: afterToken >= images.length ? null : afterToken,
    });
  });
}
