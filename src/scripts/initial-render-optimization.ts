// This file is manually used to generate the "preload" link tags for the mocked
// First Contentful Paint optimization mentioned in index.html
//
// To execute it, import `execute` in one of the application-related files
// (e.g., main.ts) and then look at the browser's console's logs.
//
// TODO: Figure out a way to run this file on its own.

import {
  NextBatchImageData,
  Src,
  SupportedDpr,
  SupportedDprs,
  SupportedImageWidthCssPx,
} from '@/api-clients/image';
import { thresholds } from '@/plugins/vuetify';

/**
 * @returns  A string for each value of SupportedImageWidthCssPx with the
 * following structure:
 *   <link rel="preload" as="image" href="..." imagesrcset="..." media="..."/>
 */
function constructLinkTag(
  dprToSrc: Map<SupportedDpr, Src>,
  cssWidth: SupportedImageWidthCssPx,
): string {
  // Construct `srcset` attribute.
  const srcSetItems = Array.from(dprToSrc.entries()).reduce(
    (accumulatedSrcSetItems, dprSrcTuple) => {
      const [dpr, src] = dprSrcTuple;
      const srcSetItem = `${src} ${dpr}x`;
      accumulatedSrcSetItems.push(srcSetItem);
      return accumulatedSrcSetItems;
    },
    [] as Array<string>,
  );
  const srcSet = srcSetItems.join(', ');

  // Unsure why TypeScript isn't able to deduce that there's a last item and
  // why we need the non-nullable assertion operator.
  const highestSupportedDpr = SupportedDprs.at(-1)!;
  const href = dprToSrc.get(highestSupportedDpr);

  // Construct `media` attribute.
  //
  // Notes:
  //   1. The media values depend on the `updateGridColumnDimensions` algorithm
  //   and the server's supported image width and pixel density.
  //   2. The simple logic pattern here is coincidental. We haven't deduced a
  //   closed-form formula for all possibilities of updateGridColumnDimensions
  //   and breakpoint thresholds.
  let media: string;
  if (cssWidth === 256) {
    media = `(width < ${thresholds.lg}px)`;
  } else {
    media = `(${thresholds.lg}px <= width)`;
  }

  return `<link rel="preload" imagesrcset="${srcSet}" href="${href}" media="${media}" as="image" />`;
}

function constructLinkTagsForImageData(
  imageData: NextBatchImageData,
): Array<string> {
  const result = [] as Array<string>;

  imageData.srcs.forEach((dprToSrc, cssWidth) => {
    result.push(constructLinkTag(dprToSrc, cssWidth));
  });

  return result;
}

function constructLinkTagsForImageDataBatch(
  batch: Array<NextBatchImageData>,
): Array<string> {
  return batch.flatMap(constructLinkTagsForImageData);
}

const execute = () => {
  const batch: Array<NextBatchImageData> = [
    {
      srcs: new Map([
        [
          256,
          new Map([
            [1, '/assets/256/1x/apples.jpg'],
            [2, '/assets/256/2x/apples.jpg'],
            [3, '/assets/256/3x/apples.jpg'],
          ]),
        ],
        [
          512,
          new Map([
            [1, '/assets/512/1x/apples.jpg'],
            [2, '/assets/512/2x/apples.jpg'],
            [3, '/assets/512/3x/apples.jpg'],
          ]),
        ],
      ]),
      isAd: false,
    },
    {
      srcs: new Map([
        [
          256,
          new Map([
            [1, '/assets/256/1x/cathedral.jpeg'],
            [2, '/assets/256/2x/cathedral.jpeg'],
            [3, '/assets/256/3x/cathedral.jpeg'],
          ]),
        ],
        [
          512,
          new Map([
            [1, '/assets/512/1x/cathedral.jpeg'],
            [2, '/assets/512/2x/cathedral.jpeg'],
            [3, '/assets/512/3x/cathedral.jpeg'],
          ]),
        ],
      ]),
      isAd: false,
    },
    {
      srcs: new Map([
        [
          256,
          new Map([
            [1, '/assets/256/1x/mountain 2.jpg'],
            [2, '/assets/256/2x/mountain 2.jpg'],
            [3, '/assets/256/3x/mountain 2.jpg'],
          ]),
        ],
        [
          512,
          new Map([
            [1, '/assets/512/1x/mountain 2.jpg'],
            [2, '/assets/512/2x/mountain 2.jpg'],
            [3, '/assets/512/3x/mountain 2.jpg'],
          ]),
        ],
      ]),
      isAd: false,
    },
    {
      srcs: new Map([
        [
          256,
          new Map([
            [1, '/assets/256/1x/sunflowers.jpg'],
            [2, '/assets/256/2x/sunflowers.jpg'],
            [3, '/assets/256/3x/sunflowers.jpg'],
          ]),
        ],
        [
          512,
          new Map([
            [1, '/assets/512/1x/sunflowers.jpg'],
            [2, '/assets/512/2x/sunflowers.jpg'],
            [3, '/assets/512/3x/sunflowers.jpg'],
          ]),
        ],
      ]),
      isAd: false,
    },
    {
      srcs: new Map([
        [
          256,
          new Map([
            [1, '/assets/256/1x/vase-flowers.jpg'],
            [2, '/assets/256/2x/vase-flowers.jpg'],
            [3, '/assets/256/3x/vase-flowers.jpg'],
          ]),
        ],
        [
          512,
          new Map([
            [1, '/assets/512/1x/vase-flowers.jpg'],
            [2, '/assets/512/2x/vase-flowers.jpg'],
            [3, '/assets/512/3x/vase-flowers.jpg'],
          ]),
        ],
      ]),
      isAd: false,
    },
    {
      srcs: new Map([
        [
          256,
          new Map([
            [1, '/assets/256/1x/driving-dirt-road.jpg'],
            [2, '/assets/256/2x/driving-dirt-road.jpg'],
            [3, '/assets/256/3x/driving-dirt-road.jpg'],
          ]),
        ],
        [
          512,
          new Map([
            [1, '/assets/512/1x/driving-dirt-road.jpg'],
            [2, '/assets/512/2x/driving-dirt-road.jpg'],
            [3, '/assets/512/3x/driving-dirt-road.jpg'],
          ]),
        ],
      ]),
      isAd: false,
    },
    {
      srcs: new Map([
        [
          256,
          new Map([
            [1, '/assets/256/1x/elbphilharmonie-concert-hall.jpg'],
            [2, '/assets/256/2x/elbphilharmonie-concert-hall.jpg'],
            [3, '/assets/256/3x/elbphilharmonie-concert-hall.jpg'],
          ]),
        ],
        [
          512,
          new Map([
            [1, '/assets/512/1x/elbphilharmonie-concert-hall.jpg'],
            [2, '/assets/512/2x/elbphilharmonie-concert-hall.jpg'],
            [3, '/assets/512/3x/elbphilharmonie-concert-hall.jpg'],
          ]),
        ],
      ]),
      isAd: false,
    },
    {
      srcs: new Map([
        [
          256,
          new Map([
            [1, '/assets/256/1x/las-setas-de-sevilla.jpg'],
            [2, '/assets/256/2x/las-setas-de-sevilla.jpg'],
            [3, '/assets/256/3x/las-setas-de-sevilla.jpg'],
          ]),
        ],
        [
          512,
          new Map([
            [1, '/assets/512/1x/las-setas-de-sevilla.jpg'],
            [2, '/assets/512/2x/las-setas-de-sevilla.jpg'],
            [3, '/assets/512/3x/las-setas-de-sevilla.jpg'],
          ]),
        ],
      ]),
      isAd: false,
    },
    {
      srcs: new Map([
        [
          256,
          new Map([
            [1, '/assets/256/1x/jellyfish.jpg'],
            [2, '/assets/256/2x/jellyfish.jpg'],
            [3, '/assets/256/3x/jellyfish.jpg'],
          ]),
        ],
        [
          512,
          new Map([
            [1, '/assets/512/1x/jellyfish.jpg'],
            [2, '/assets/512/2x/jellyfish.jpg'],
            [3, '/assets/512/3x/jellyfish.jpg'],
          ]),
        ],
      ]),
      isAd: false,
    },
    {
      srcs: new Map([
        [
          256,
          new Map([
            [1, '/assets/256/1x/astronomy.jpg'],
            [2, '/assets/256/2x/astronomy.jpg'],
            [3, '/assets/256/3x/astronomy.jpg'],
          ]),
        ],
        [
          512,
          new Map([
            [1, '/assets/512/1x/astronomy.jpg'],
            [2, '/assets/512/2x/astronomy.jpg'],
            [3, '/assets/512/3x/astronomy.jpg'],
          ]),
        ],
      ]),
      isAd: false,
    },
    {
      srcs: new Map([
        [
          256,
          new Map([
            [1, '/assets/256/1x/ai-generated-luxury-hotel.jpg'],
            [2, '/assets/256/2x/ai-generated-luxury-hotel.jpg'],
            [3, '/assets/256/3x/ai-generated-luxury-hotel.jpg'],
          ]),
        ],
        [
          512,
          new Map([
            [1, '/assets/512/1x/ai-generated-luxury-hotel.jpg'],
            [2, '/assets/512/2x/ai-generated-luxury-hotel.jpg'],
            [3, '/assets/512/3x/ai-generated-luxury-hotel.jpg'],
          ]),
        ],
      ]),
      isAd: false,
    },
  ];
  const linkTags = constructLinkTagsForImageDataBatch(batch);
  console.log(linkTags.join('\n'));
};

// Currently running the generation of link tags by importing this method
// in main.ts and then looking at the console's log when we load the app.
export default execute;
