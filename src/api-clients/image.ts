import { conductBernoulliTrial } from '@/utils/random';

// Prefixing with "NextBatch" because ImageData seems to be a reserved type.
export type NextBatchImageData = {
  // The motivation here is to enable responsive images: Enable different
  // croppings of an image (art direction problem) and different resolutions
  // for each cropping (resolution switching problem).
  //
  // Please refer here for more contextual information:
  //   https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images

  srcs: Map<SupportedImageWidthCssPx, Map<SupportedDpr, Src>>;
  isAd: boolean;
};

// The set is to prevent accidental duplication.
const SupportedImageWidthCssPx = Array.from(
  new Set([256, 512] as Array<SupportedImageWidthCssPx>),
);
SupportedImageWidthCssPx.sort();
Object.freeze(SupportedImageWidthCssPx);
export { SupportedImageWidthCssPx };

// TODO: Figure out a way to not have to duplicate the contents of the
// value SupportedDprs
export type SupportedImageWidthCssPx = 256 | 512;

// The set is to prevent accidental duplication.
const SupportedDprs = Array.from(new Set([1, 2, 3] as Array<SupportedDpr>));
SupportedDprs.sort();
Object.freeze(SupportedDprs);
export { SupportedDprs };

// TODO: Figure out a way to not have to duplicate the contents of the
// value SupportedDprs
export type SupportedDpr = 1 | 2 | 3;

export type Src = string;

function generateMockData(): Array<NextBatchImageData> {
  const FileNamesUsedForInitialOptimization = [
    'apples.jpg',
    'cathedral.jpeg',
    'mountain 2.jpg',
    'sunflowers.jpg',
    'vase-flowers.jpg',
    'driving-dirt-road.jpg',
    'elbphilharmonie-concert-hall.jpg',
    'las-setas-de-sevilla.jpg',
    'jellyfish.jpg',
    'astronomy.jpg',
    'ai-generated-luxury-hotel.jpg',
  ];

  const FileNames = [
    ...FileNamesUsedForInitialOptimization,
    'sand-next-to-water.jpg',
    '3d-render-ball.jpeg',
    'latte-art.jpeg',
    'guitar.jpg',
    'music.jpg',
    'heliconia.jpg',
    'sparrow.jpg',
    'picnic.jpg',
    'grass.jpg',
    'mountain-3.jpg',
    'baseball.jpeg',
    'kettle-fruit.jpeg',
    'activity.jpg',
    'trees.jpg',
    'dandelion.jpg',
    'hungarian-parliament-building.jpg',
    'bjj.jpeg',
    'cat.jpeg',
    'autumn-leaves.jpg',
    'white-sand.jpg',
    'sea-ship-wreck.jpg',
    'tree.jpg',
    'elephant.jpg',
    'industrial-reflection.jpg',
    'surfing.jpeg',
    'contour.jpeg',
    'the-royal-library.jpeg',
    'starry-sky.jpg',
    'belem-tower.jpeg',
    'white-flower-lot.jpeg',
    'jellyfish.jpeg',
    'bus-blur.jpeg',
    'iced-coffee.jpeg',
    'big-pipes-side-of-building.jpg',
    'person-in-front-of-skyline.jpeg',
    'sutterlin.jpg',
    'tokyo-tower.jpeg',
    'seattle.jpeg',
    'tennis.jpeg',
    'ai-generated-caver.jpg',
    'raindrop-leaf.jpg',
    'highway-tree-mountain-rainbow.jpg',
    'hallway-with-columns.jpeg',
    'climbing2.jpeg',
    'plant.jpeg',
    'cathedral.jpg',
    'goat.jpg',
    'snowboarding7.jpeg',
    'hinduism.jpg',
    'negative-castle.jpg',
    'squirrel.jpg',
    'backcountry-skiing.jpeg',
    'people.jpg',
    'interior-decoration-variety.jpg',
    'crocodile.jpeg',
    'white.jpg',
    'black-and-white-photo-of-a-curved-building.jpeg',
    'lamps.jpg',
    'motorbiking.jpeg',
    'flowers.jpg',
    'bird.jpg',
    'shiny2.jpeg',
    'snowboarding5.jpeg',
    'building.jpeg',
    'snow-ramp.jpeg',
    'bird-resting-on-building.jpg',
    'chair-by-window.jpg',
    'brick-building.jpeg',
    'parrot.jpg',
    'trevi.jpeg',
    'lighting.jpg',
    'city.jpg',
    'colorful-lines-of-light.jpeg',
    'singapore.jpeg',
    'fox.jpeg',
    'ferris-wheel.jpg',
    'drinking-glasses.jpg',
    'snake.jpeg',
    'scuba-diving.jpeg',
    'boat-by-mountain-forests.jpg',
    'paper-boat.jpg',
    'library.jpeg',
    'desert.jpeg',
    'snowboarding4.jpeg',
    'street-light.jpeg',
    'golf.jpeg',
    'palace.jpeg',
    'adult-child-stairs.jpg',
    'charles-v-circular-courtyard.jpg',
    'mallard-duck.jpg',
    'ice-picking.jpeg',
    'stationary-biking.jpeg',
    'low-rise-on-highish-rise.jpeg',
    'kayaking-glaciers.jpeg',
    'puzzle.jpg',
    'pancakes.jpeg',
    'climbing.jpeg',
    'london.jpg',
    'people-under-cherry-blossoms-casual.jpeg',
    'breakfast-in-bed.jpeg',
    'avocado-toast.jpeg',
    'gymnastics.jpeg',
    'skiing.jpeg',
    'muscat.jpeg',
    'parachute.jpeg',
    'peninsula.jpeg',
    'street.jpg',
    'ai-generated-snow-leopard.png',
    'post-office.jpeg',
    'camera.jpg',
    'clock-tower.jpeg',
    'snow-capped-mountain-golden-hour.jpeg',
    'ai-generated-lady.jpg',
    'basketball2.jpeg',
    'rooster.jpeg',
    'busy-street.jpeg',
    'yurakucho.jpeg',
    'concept.jpg',
    'washington-monument.jpeg',
    'mountain.jpg',
    'amsterdam.jpeg',
    'abbey.jpg',
    'tulips.jpg',
    'snowboarding6.jpeg',
    'hot-air-balloon.jpg',
    'shiny.jpeg',
    'library-of-celsus.jpeg',
    'peacock-tail.jpeg',
    'snow-mountains.jpeg',
    'bee.jpeg',
    'computer.jpeg',
    'paragliding.jpeg',
    'code.jpeg',
    'pastries.jpg',
    'mountain-2.jpg',
    'cactus.jpeg',
    'layers.jpeg',
    'basketball.jpeg',
    'coffee.jpg',
    'ballet.jpeg',
    'snowboarding2.jpeg',
    'hoverfly.jpg',
    'witch.jpg',
    'spheres.jpeg',
    'heidelberg-castle.jpeg',
    'surfing2.jpeg',
    'swimming.jpeg',
    'superficially-impoverished.jpeg',
    'chips.jpeg',
    'muffin.jpeg',
    'eclipse.jpeg',
    'milan.jpeg',
    'friends-eating.jpeg',
    'surfing3.jpeg',
    'man-with-tree.jpeg',
    'football.jpeg',
    'snowboarding3.jpeg',
    'tennis2.jpeg',
    'kolkata.jpeg',
  ];

  return FileNames.map((fileName) => {
    return {
      srcs: new Map([
        [
          256,
          new Map([
            [1, `/assets/256/1x/${fileName}`],
            [2, `/assets/256/2x/${fileName}`],
            [3, `/assets/256/3x/${fileName}`],
          ]),
        ],
        [
          512,
          new Map([
            [1, `/assets/512/1x/${fileName}`],
            [2, `/assets/512/2x/${fileName}`],
            [3, `/assets/512/3x/${fileName}`],
          ]),
        ],
      ]),
      isAd: conductBernoulliTrial(1 / 10),
    };
  });
}

const images = generateMockData();

const MoreCount = 11;

export function getNextBatch(afterToken: number | undefined = 0): Promise<{
  data: Array<NextBatchImageData>;
  afterToken: number | null;
}> {
  const data = images.slice(afterToken, afterToken + MoreCount);
  afterToken += MoreCount;

  return new Promise(async (resolve) => {
    await new Promise((waitResolve) => setTimeout(waitResolve, 0.5 * 1000));

    resolve({
      data,
      afterToken: afterToken >= images.length ? null : afterToken,
    });
  });
}

/**
 *
 * @param columnWidth
 * @returns In the case of a non-nullable column width, return the minimum
 * supported CSS Pixel Width that's greater than the provided columnWidth or
 * the greatest supported CSS Pixel Width.
 */
export function getMatchingSupportedCssPixelWidth(
  columnWidth: number | undefined,
): SupportedImageWidthCssPx | null {
  if (columnWidth === undefined) {
    return null;
  }

  let supportedCssPixelWidthFit: SupportedImageWidthCssPx | undefined =
    SupportedImageWidthCssPx.find((supported) => supported >= columnWidth);

  if (!supportedCssPixelWidthFit) {
    supportedCssPixelWidthFit = SupportedImageWidthCssPx.at(-1);
  }

  return supportedCssPixelWidthFit as SupportedImageWidthCssPx;
}

/**
 *
 * @param devicePixelRatio
 * @returns In the case of a non-nullable DPR return the minimum supported
 * DPR that's greater than the provided one or the greatest supported DPR.
 */
export function getMatchingSupportedDpr(
  devicePixelRatio: number | undefined,
): SupportedDpr | null {
  if (devicePixelRatio === undefined) {
    return null;
  }

  let supportedDprFit: SupportedDpr | undefined = SupportedDprs.find(
    (supported) => supported >= devicePixelRatio,
  );

  if (!supportedDprFit) {
    supportedDprFit = SupportedDprs.at(-1);
  }

  return supportedDprFit as SupportedDpr;
}

export function getAdIdentifier(imageData: NextBatchImageData): Src {
  // The specific src is arbitrary here.
  return imageData.srcs.get(256)!.get(1)!;
}
