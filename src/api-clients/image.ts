// Prefixing with "NextBatch" because ImageData seems to be a reserved type.
export type NextBatchImageData = {
  // The motivation here is to enable responsive images: Enable different
  // croppings of an image (art direction problem) and different resolutions
  // for each cropping (resolution switching problem).
  //
  // Please refer here for more contextual information:
  //   https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images

  srcs: Map<SupportedImageWidthCssPx, Map<SupportedDpr, Src>>;
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
    'abbey.jpg',
    'activity.jpg',
    'adult-child-stairs.jpg',
    'ai-generated-caver.jpg',
    'ai-generated-lady.jpg',
    'ai-generated-luxury-hotel.jpg',
    'ai-generated-snow-leopard.png',
    'apples.jpg',
    'astronomy.jpg',
    'autumn-leaves.jpg',
    'big-pipes-side-of-building.jpg',
    'bird-resting-on-building.jpg',
    'bird.jpg',
    'boat-by-mountain-forests.jpg',
    'bus-blur.jpeg',
    'camera.jpg',
    'cathedral.jpeg',
    'cathedral.jpg',
    'chair-by-window.jpg',
    'charles-v-circular-courtyard.jpg',
    'city.jpg',
    'coffee.jpg',
    'concept.jpg',
    'dandelion.jpg',
    'desert.jpeg',
    'drinking-glasses.jpg',
    'driving-dirt-road.jpg',
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
