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
  const fileNames = [
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
    'ai-generated-lady.jpg',
    'mallard-duck.jpg',
    'charles-v-circular-courtyard.jpg',
    'chair-by-window.jpg',
    'highway-tree-mountain-rainbow.jpg',
    'dandelion.jpg',
    'paper-boat.jpg',
    'industrial-reflection.jpg',
    'big-pipes-side-of-building.jpg',
    'sea-ship-wreck.jpg',
    'boat-by-mountain-forests.jpg',
    'grass.jpg',
    'squirrel.jpg',
    'interior-decoration-variety.jpg',
    'sand-next-to-water.jpg',
    'ai-generated-snow-leopard.png',
    'tree.jpg',
    'autumn-leaves.jpg',
    'hot-air-balloon.jpg',
    'white-sand.jpg',
    'bird-resting-on-building.jpg',
    'tulips.jpg',
    'starry-sky.jpg',
    'adult-child-stairs.jpg',
    'drinking-glasses.jpg',
    'raindrop-leaf.jpg',
    'goat.jpg',
    'picnic.jpg',
    'ai-generated-caver.jpg',
    'people.jpg',
    'negative-castle.jpg',
    'hinduism.jpg',
    'sutterlin.jpg',
    'white.jpg',
    'snow-ramp.jpeg',
    'post-office.jpeg',
    'trees.jpg',
    'camera.jpg',
    'hoverfly.jpg',
    'guitar.jpg',
    'latte-art.jpeg',
    'heliconia.jpg',
    'concept.jpg',
    'activity.jpg',
    'lighting.jpg',
    'mountain.jpg',
    'desert.jpeg',
    'hungarian-parliament-building.jpg',
    'sparrow.jpg',
    'cathedral.jpg',
    'bus-blur.jpeg',
    'ferris-wheel.jpg',
    'witch.jpg',
    'music.jpg',
    'mountain-3.jpg',
    'bird.jpg',
    'mountain-2.jpg',
    'puzzle.jpg',
    'city.jpg',
    'snow-mountains.jpeg',
    'lamps.jpg',
    'elephant.jpg',
    'london.jpg',
    'flowers.jpg',
    'abbey.jpg',
    'pastries.jpg',
    'coffee.jpg',
    'street.jpg',
    'parrot.jpg',
    'peninsula.jpeg',
    '3d-render-ball.jpeg',
    'amsterdam.jpeg',
    'avocado-toast.jpeg',
    'backcountry-skiing.jpeg',
    'ballet.jpeg',
    'baseball.jpeg',
    'basketball.jpeg',
    'basketball2.jpeg',
    'bee.jpeg',
    'belem-tower.jpeg',
    'bjj.jpeg',
    'black-and-white-photo-of-a-curved-building.jpeg',
    'breakfast-in-bed.jpeg',
    'brick-building.jpeg',
    'building.jpeg',
    'busy-street.jpeg',
    'cactus.jpeg',
    'cat.jpeg',
    'chips.jpeg',
    'climbing.jpeg',
    'climbing2.jpeg',
    'clock-tower.jpeg',
    'code.jpeg',
    'colorful-lines-of-light.jpeg',
    'computer.jpeg',
    'contour.jpeg',
    'crocodile.jpeg',
    'eclipse.jpeg',
    'football.jpeg',
    'fox.jpeg',
    'friends-eating.jpeg',
    'golf.jpeg',
    'gymnastics.jpeg',
    'hallway-with-columns.jpeg',
    'heidelberg-castle.jpeg',
    'ice-picking.jpeg',
    'iced-coffee.jpeg',
    'jellyfish.jpeg',
    'kayaking-glaciers.jpeg',
    'kettle-fruit.jpeg',
    'kolkata.jpeg',
    'layers.jpeg',
    'library-of-celsus.jpeg',
    'library.jpeg',
    'low-rise-on-highish-rise.jpeg',
    'man-with-tree.jpeg',
    'milan.jpeg',
    'motorbiking.jpeg',
    'muffin.jpeg',
    'muscat.jpeg',
    'palace.jpeg',
    'pancakes.jpeg',
    'parachute.jpeg',
    'paragliding.jpeg',
    'peacock-tail.jpeg',
    'people-under-cherry-blossoms-casual.jpeg',
    'person-in-front-of-skyline.jpeg',
    'plant.jpeg',
    'rooster.jpeg',
    'scuba-diving.jpeg',
  ];

  return fileNames.map((fileName) => {
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
