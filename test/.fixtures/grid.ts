import { GridItemDataTestVersion } from 'test/test-utils/grid-generate';

// Original Motivation:
//
// Define a reference grid that can be used to test the feed* functionalities
// from @/utils/grid.
//
// Intentions:
//   - Based on image heights seen in public/assets/256/1x
//   - Based off a common desktop visual viewport with height of 1080.
//   - Based on a vertical gap amount (8) used in the application
//   - Not unnecessarily tall
//   - When the visual viewport is in the "middle" of the grid, there's
//     "significant" amount of items above and below to fully test the
//     aforementioned functionalities.
//
// Used generateRandomGrid from test/testUtils/grid-generate.ts to help
// construct it:
//
// >>>
// const {grid, srcToHeightMapping} = generateRandomGrid({
//   possibleHeights: [
//     341, 163, 171, 171, 384, 384, 384, 171, 155, 320, 192, 171, 171, 171, 384,
//     171, 384, 171, 384, 341, 192, 171, 171, 256, 323, 192, 171, 375, 181, 385,
//     171, 384, 171, 171, 384, 170, 384, 384, 175, 384, 171,
//   ],
//   GapAmount: 8,
//   columnCount: 3,

//   // `7` for two primary reasons (not related to columnCount), using
//   // scrolling down as an example:
//   //   - Want to be able to check the case where something from the top
//   //   invisible columns goes directly to the bottom invisible columns.
//   //
//   //   - Want for there to still be a significant number of items in the top
//   //   invisible columns after encountering the previous reason's case.
//   //
//   //     - (This will actually be directly relevant to a future optimization
//   //     where we'll want to include some extra items from the top invisible
//   //     columns in the top of the visible columns even though they don't
//   //     intersect the visual viewport with based on their dimensions.)
//
//   minimumColumnHeight: 1080 * 7,
// });
// <<<

export const grid = [
  [
    {
      src: '0-0',
      height: 192,
      top: 0,
      bottom: 192,
    },
    {
      src: '0-1',
      height: 384,
      top: 200,
      bottom: 584,
    },
    {
      src: '0-2',
      height: 384,
      top: 592,
      bottom: 976,
    },
    {
      src: '0-3',
      height: 171,
      top: 984,
      bottom: 1155,
    },
    {
      src: '0-4',
      height: 384,
      top: 1163,
      bottom: 1547,
    },
    {
      src: '0-5',
      height: 384,
      top: 1555,
      bottom: 1939,
    },
    {
      src: '0-6',
      height: 171,
      top: 1947,
      bottom: 2118,
    },
    {
      src: '0-7',
      height: 375,
      top: 2126,
      bottom: 2501,
    },
    {
      src: '0-8',
      height: 171,
      top: 2509,
      bottom: 2680,
    },
    {
      src: '0-9',
      height: 341,
      top: 2688,
      bottom: 3029,
    },
    {
      src: '0-10',
      height: 192,
      top: 3037,
      bottom: 3229,
    },
    {
      src: '0-11',
      height: 192,
      top: 3237,
      bottom: 3429,
    },
    {
      src: '0-12',
      height: 384,
      top: 3437,
      bottom: 3821,
    },
    {
      src: '0-13',
      height: 171,
      top: 3829,
      bottom: 4000,
    },
    {
      src: '0-14',
      height: 384,
      top: 4008,
      bottom: 4392,
    },
    {
      src: '0-15',
      height: 192,
      top: 4400,
      bottom: 4592,
    },
    {
      src: '0-16',
      height: 323,
      top: 4600,
      bottom: 4923,
    },
    {
      src: '0-17',
      height: 171,
      top: 4931,
      bottom: 5102,
    },
    {
      src: '0-18',
      height: 384,
      top: 5110,
      bottom: 5494,
    },
    {
      src: '0-19',
      height: 385,
      top: 5502,
      bottom: 5887,
    },
    {
      src: '0-20',
      height: 341,
      top: 5895,
      bottom: 6236,
    },
    {
      src: '0-21',
      height: 192,
      top: 6244,
      bottom: 6436,
    },
    {
      src: '0-22',
      height: 384,
      top: 6444,
      bottom: 6828,
    },
    {
      src: '0-23',
      height: 384,
      top: 6836,
      bottom: 7220,
    },
    {
      src: '0-24',
      height: 384,
      top: 7228,
      bottom: 7612,
    },
  ],
  [
    {
      src: '1-0',
      height: 192,
      top: 0,
      bottom: 192,
    },
    {
      src: '1-1',
      height: 171,
      top: 200,
      bottom: 371,
    },
    {
      src: '1-2',
      height: 192,
      top: 379,
      bottom: 571,
    },
    {
      src: '1-3',
      height: 155,
      top: 579,
      bottom: 734,
    },
    {
      src: '1-4',
      height: 341,
      top: 742,
      bottom: 1083,
    },
    {
      src: '1-5',
      height: 171,
      top: 1091,
      bottom: 1262,
    },
    {
      src: '1-6',
      height: 384,
      top: 1270,
      bottom: 1654,
    },
    {
      src: '1-7',
      height: 384,
      top: 1662,
      bottom: 2046,
    },
    {
      src: '1-8',
      height: 384,
      top: 2054,
      bottom: 2438,
    },
    {
      src: '1-9',
      height: 171,
      top: 2446,
      bottom: 2617,
    },
    {
      src: '1-10',
      height: 384,
      top: 2625,
      bottom: 3009,
    },
    {
      src: '1-11',
      height: 384,
      top: 3017,
      bottom: 3401,
    },
    {
      src: '1-12',
      height: 171,
      top: 3409,
      bottom: 3580,
    },
    {
      src: '1-13',
      height: 171,
      top: 3588,
      bottom: 3759,
    },
    {
      src: '1-14',
      height: 171,
      top: 3767,
      bottom: 3938,
    },
    {
      src: '1-15',
      height: 171,
      top: 3946,
      bottom: 4117,
    },
    {
      src: '1-16',
      height: 384,
      top: 4125,
      bottom: 4509,
    },
    {
      src: '1-17',
      height: 384,
      top: 4517,
      bottom: 4901,
    },
    {
      src: '1-18',
      height: 170,
      top: 4909,
      bottom: 5079,
    },
    {
      src: '1-19',
      height: 170,
      top: 5087,
      bottom: 5257,
    },
    {
      src: '1-20',
      height: 171,
      top: 5265,
      bottom: 5436,
    },
    {
      src: '1-21',
      height: 155,
      top: 5444,
      bottom: 5599,
    },
    {
      src: '1-22',
      height: 341,
      top: 5607,
      bottom: 5948,
    },
    {
      src: '1-23',
      height: 384,
      top: 5956,
      bottom: 6340,
    },
    {
      src: '1-24',
      height: 171,
      top: 6348,
      bottom: 6519,
    },
    {
      src: '1-25',
      height: 384,
      top: 6527,
      bottom: 6911,
    },
    {
      src: '1-26',
      height: 384,
      top: 6919,
      bottom: 7303,
    },
    {
      src: '1-27',
      height: 171,
      top: 7311,
      bottom: 7482,
    },
    {
      src: '1-28',
      height: 384,
      top: 7490,
      bottom: 7874,
    },
  ],
  [
    {
      src: '2-0',
      height: 323,
      top: 0,
      bottom: 323,
    },
    {
      src: '2-1',
      height: 171,
      top: 331,
      bottom: 502,
    },
    {
      src: '2-2',
      height: 171,
      top: 510,
      bottom: 681,
    },
    {
      src: '2-3',
      height: 171,
      top: 689,
      bottom: 860,
    },
    {
      src: '2-4',
      height: 385,
      top: 868,
      bottom: 1253,
    },
    {
      src: '2-5',
      height: 171,
      top: 1261,
      bottom: 1432,
    },
    {
      src: '2-6',
      height: 192,
      top: 1440,
      bottom: 1632,
    },
    {
      src: '2-7',
      height: 171,
      top: 1640,
      bottom: 1811,
    },
    {
      src: '2-8',
      height: 192,
      top: 1819,
      bottom: 2011,
    },
    {
      src: '2-9',
      height: 320,
      top: 2019,
      bottom: 2339,
    },
    {
      src: '2-10',
      height: 171,
      top: 2347,
      bottom: 2518,
    },
    {
      src: '2-11',
      height: 181,
      top: 2526,
      bottom: 2707,
    },
    {
      src: '2-12',
      height: 171,
      top: 2715,
      bottom: 2886,
    },
    {
      src: '2-13',
      height: 384,
      top: 2894,
      bottom: 3278,
    },
    {
      src: '2-14',
      height: 171,
      top: 3286,
      bottom: 3457,
    },
    {
      src: '2-15',
      height: 192,
      top: 3465,
      bottom: 3657,
    },
    {
      src: '2-16',
      height: 256,
      top: 3665,
      bottom: 3921,
    },
    {
      src: '2-17',
      height: 171,
      top: 3929,
      bottom: 4100,
    },
    {
      src: '2-18',
      height: 171,
      top: 4108,
      bottom: 4279,
    },
    {
      src: '2-19',
      height: 171,
      top: 4287,
      bottom: 4458,
    },
    {
      src: '2-20',
      height: 171,
      top: 4466,
      bottom: 4637,
    },
    {
      src: '2-21',
      height: 171,
      top: 4645,
      bottom: 4816,
    },
    {
      src: '2-22',
      height: 256,
      top: 4824,
      bottom: 5080,
    },
    {
      src: '2-23',
      height: 375,
      top: 5088,
      bottom: 5463,
    },
    {
      src: '2-24',
      height: 323,
      top: 5471,
      bottom: 5794,
    },
    {
      src: '2-25',
      height: 171,
      top: 5802,
      bottom: 5973,
    },
    {
      src: '2-26',
      height: 171,
      top: 5981,
      bottom: 6152,
    },
    {
      src: '2-27',
      height: 385,
      top: 6160,
      bottom: 6545,
    },
    {
      src: '2-28',
      height: 171,
      top: 6553,
      bottom: 6724,
    },
    {
      src: '2-29',
      height: 384,
      top: 6732,
      bottom: 7116,
    },
    {
      src: '2-30',
      height: 384,
      top: 7124,
      bottom: 7508,
    },
    {
      src: '2-31',
      height: 384,
      top: 7516,
      bottom: 7900,
    },
  ],
] as Readonly<Array<Array<GridItemDataTestVersion>>>;

export const srcToHeightMapping = {
  '0-0': 192,
  '0-1': 384,
  '0-2': 384,
  '0-3': 171,
  '0-4': 384,
  '0-5': 384,
  '0-6': 171,
  '0-7': 375,
  '0-8': 171,
  '0-9': 341,
  '0-10': 192,
  '0-11': 192,
  '0-12': 384,
  '0-13': 171,
  '0-14': 384,
  '0-15': 192,
  '0-16': 323,
  '0-17': 171,
  '0-18': 384,
  '0-19': 385,
  '0-20': 341,
  '0-21': 192,
  '0-22': 384,
  '0-23': 384,
  '0-24': 384,
  '1-0': 192,
  '1-1': 171,
  '1-2': 192,
  '1-3': 155,
  '1-4': 341,
  '1-5': 171,
  '1-6': 384,
  '1-7': 384,
  '1-8': 384,
  '1-9': 171,
  '1-10': 384,
  '1-11': 384,
  '1-12': 171,
  '1-13': 171,
  '1-14': 171,
  '1-15': 171,
  '1-16': 384,
  '1-17': 384,
  '1-18': 170,
  '1-19': 170,
  '1-20': 171,
  '1-21': 155,
  '1-22': 341,
  '1-23': 384,
  '1-24': 171,
  '1-25': 384,
  '1-26': 384,
  '1-27': 171,
  '1-28': 384,
  '2-0': 323,
  '2-1': 171,
  '2-2': 171,
  '2-3': 171,
  '2-4': 385,
  '2-5': 171,
  '2-6': 192,
  '2-7': 171,
  '2-8': 192,
  '2-9': 320,
  '2-10': 171,
  '2-11': 181,
  '2-12': 171,
  '2-13': 384,
  '2-14': 171,
  '2-15': 192,
  '2-16': 256,
  '2-17': 171,
  '2-18': 171,
  '2-19': 171,
  '2-20': 171,
  '2-21': 171,
  '2-22': 256,
  '2-23': 375,
  '2-24': 323,
  '2-25': 171,
  '2-26': 171,
  '2-27': 385,
  '2-28': 171,
  '2-29': 384,
  '2-30': 384,
  '2-31': 384,
} as const;

// Manually extracted these subsets from the reference `grid`. It relies on
// the visual viewport being initially in the middle. This translates roughly
// to the viewport top being at 3240 and its bottom at 4320 (derivation below).
//
//   For the derivation of the aforementioned 3240 and 4320, we remind ourselves
//   of the fact that the height of the reference grid is roughly 7 visual
//   viewports stacked on top of each other. Ergo, the visual viewport is
//   roughly in the middle when the height above it is exactly equal to 3 visual
//   viewports. Furthermore, we assume the height of the visual viewport is
//   1080. Therefore, we get 3240 from 3 * 1080 and 4320 from 3240 + 1080.

export const TopInvisibleColumnsInitialMiddle = [
  [
    {
      src: '0-0',
      height: 192,
      top: 0,
      bottom: 192,
    },
    {
      src: '0-1',
      height: 384,
      top: 200,
      bottom: 584,
    },
    {
      src: '0-2',
      height: 384,
      top: 592,
      bottom: 976,
    },
    {
      src: '0-3',
      height: 171,
      top: 984,
      bottom: 1155,
    },
    {
      src: '0-4',
      height: 384,
      top: 1163,
      bottom: 1547,
    },
    {
      src: '0-5',
      height: 384,
      top: 1555,
      bottom: 1939,
    },
    {
      src: '0-6',
      height: 171,
      top: 1947,
      bottom: 2118,
    },
    {
      src: '0-7',
      height: 375,
      top: 2126,
      bottom: 2501,
    },
    {
      src: '0-8',
      height: 171,
      top: 2509,
      bottom: 2680,
    },
    {
      src: '0-9',
      height: 341,
      top: 2688,
      bottom: 3029,
    },
    {
      src: '0-10',
      height: 192,
      top: 3037,
      bottom: 3229,
    },
  ],
  [
    {
      src: '1-0',
      height: 192,
      top: 0,
      bottom: 192,
    },
    {
      src: '1-1',
      height: 171,
      top: 200,
      bottom: 371,
    },
    {
      src: '1-2',
      height: 192,
      top: 379,
      bottom: 571,
    },
    {
      src: '1-3',
      height: 155,
      top: 579,
      bottom: 734,
    },
    {
      src: '1-4',
      height: 341,
      top: 742,
      bottom: 1083,
    },
    {
      src: '1-5',
      height: 171,
      top: 1091,
      bottom: 1262,
    },
    {
      src: '1-6',
      height: 384,
      top: 1270,
      bottom: 1654,
    },
    {
      src: '1-7',
      height: 384,
      top: 1662,
      bottom: 2046,
    },
    {
      src: '1-8',
      height: 384,
      top: 2054,
      bottom: 2438,
    },
    {
      src: '1-9',
      height: 171,
      top: 2446,
      bottom: 2617,
    },
    {
      src: '1-10',
      height: 384,
      top: 2625,
      bottom: 3009,
    },
  ],
  [
    {
      src: '2-0',
      height: 323,
      top: 0,
      bottom: 323,
    },
    {
      src: '2-1',
      height: 171,
      top: 331,
      bottom: 502,
    },
    {
      src: '2-2',
      height: 171,
      top: 510,
      bottom: 681,
    },
    {
      src: '2-3',
      height: 171,
      top: 689,
      bottom: 860,
    },
    {
      src: '2-4',
      height: 385,
      top: 868,
      bottom: 1253,
    },
    {
      src: '2-5',
      height: 171,
      top: 1261,
      bottom: 1432,
    },
    {
      src: '2-6',
      height: 192,
      top: 1440,
      bottom: 1632,
    },
    {
      src: '2-7',
      height: 171,
      top: 1640,
      bottom: 1811,
    },
    {
      src: '2-8',
      height: 192,
      top: 1819,
      bottom: 2011,
    },
    {
      src: '2-9',
      height: 320,
      top: 2019,
      bottom: 2339,
    },
    {
      src: '2-10',
      height: 171,
      top: 2347,
      bottom: 2518,
    },
    {
      src: '2-11',
      height: 181,
      top: 2526,
      bottom: 2707,
    },
    {
      src: '2-12',
      height: 171,
      top: 2715,
      bottom: 2886,
    },
  ],
] as Readonly<Array<Array<GridItemDataTestVersion>>>;

export const VisibleColumnsInitialMiddle = [
  [
    {
      src: '0-11',
      height: 192,
      top: 3237,
      bottom: 3429,
    },
    {
      src: '0-12',
      height: 384,
      top: 3437,
      bottom: 3821,
    },
    {
      src: '0-13',
      height: 171,
      top: 3829,
      bottom: 4000,
    },
    {
      src: '0-14',
      height: 384,
      top: 4008,
      bottom: 4392,
    },
  ],
  [
    {
      src: '1-11',
      height: 384,
      top: 3017,
      bottom: 3401,
    },
    {
      src: '1-12',
      height: 171,
      top: 3409,
      bottom: 3580,
    },
    {
      src: '1-13',
      height: 171,
      top: 3588,
      bottom: 3759,
    },
    {
      src: '1-14',
      height: 171,
      top: 3767,
      bottom: 3938,
    },
    {
      src: '1-15',
      height: 171,
      top: 3946,
      bottom: 4117,
    },
    {
      src: '1-16',
      height: 384,
      top: 4125,
      bottom: 4509,
    },
  ],
  [
    {
      src: '2-13',
      height: 384,
      top: 2894,
      bottom: 3278,
    },
    {
      src: '2-14',
      height: 171,
      top: 3286,
      bottom: 3457,
    },
    {
      src: '2-15',
      height: 192,
      top: 3465,
      bottom: 3657,
    },
    {
      src: '2-16',
      height: 256,
      top: 3665,
      bottom: 3921,
    },
    {
      src: '2-17',
      height: 171,
      top: 3929,
      bottom: 4100,
    },
    {
      src: '2-18',
      height: 171,
      top: 4108,
      bottom: 4279,
    },
    {
      src: '2-19',
      height: 171,
      top: 4287,
      bottom: 4458,
    },
  ],
] as Array<Array<GridItemDataTestVersion>>;

export const BottomInvisibleColumnsInitialMiddle = [
  [
    {
      src: '0-15',
      height: 192,
      top: 4400,
      bottom: 4592,
    },
    {
      src: '0-16',
      height: 323,
      top: 4600,
      bottom: 4923,
    },
    {
      src: '0-17',
      height: 171,
      top: 4931,
      bottom: 5102,
    },
    {
      src: '0-18',
      height: 384,
      top: 5110,
      bottom: 5494,
    },
    {
      src: '0-19',
      height: 385,
      top: 5502,
      bottom: 5887,
    },
    {
      src: '0-20',
      height: 341,
      top: 5895,
      bottom: 6236,
    },
    {
      src: '0-21',
      height: 192,
      top: 6244,
      bottom: 6436,
    },
    {
      src: '0-22',
      height: 384,
      top: 6444,
      bottom: 6828,
    },
    {
      src: '0-23',
      height: 384,
      top: 6836,
      bottom: 7220,
    },
    {
      src: '0-24',
      height: 384,
      top: 7228,
      bottom: 7612,
    },
  ],
  [
    {
      src: '1-17',
      height: 384,
      top: 4517,
      bottom: 4901,
    },
    {
      src: '1-18',
      height: 170,
      top: 4909,
      bottom: 5079,
    },
    {
      src: '1-19',
      height: 170,
      top: 5087,
      bottom: 5257,
    },
    {
      src: '1-20',
      height: 171,
      top: 5265,
      bottom: 5436,
    },
    {
      src: '1-21',
      height: 155,
      top: 5444,
      bottom: 5599,
    },
    {
      src: '1-22',
      height: 341,
      top: 5607,
      bottom: 5948,
    },
    {
      src: '1-23',
      height: 384,
      top: 5956,
      bottom: 6340,
    },
    {
      src: '1-24',
      height: 171,
      top: 6348,
      bottom: 6519,
    },
    {
      src: '1-25',
      height: 384,
      top: 6527,
      bottom: 6911,
    },
    {
      src: '1-26',
      height: 384,
      top: 6919,
      bottom: 7303,
    },
    {
      src: '1-27',
      height: 171,
      top: 7311,
      bottom: 7482,
    },
    {
      src: '1-28',
      height: 384,
      top: 7490,
      bottom: 7874,
    },
  ],
  [
    {
      src: '2-20',
      height: 171,
      top: 4466,
      bottom: 4637,
    },
    {
      src: '2-21',
      height: 171,
      top: 4645,
      bottom: 4816,
    },
    {
      src: '2-22',
      height: 256,
      top: 4824,
      bottom: 5080,
    },
    {
      src: '2-23',
      height: 375,
      top: 5088,
      bottom: 5463,
    },
    {
      src: '2-24',
      height: 323,
      top: 5471,
      bottom: 5794,
    },
    {
      src: '2-25',
      height: 171,
      top: 5802,
      bottom: 5973,
    },
    {
      src: '2-26',
      height: 171,
      top: 5981,
      bottom: 6152,
    },
    {
      src: '2-27',
      height: 385,
      top: 6160,
      bottom: 6545,
    },
    {
      src: '2-28',
      height: 171,
      top: 6553,
      bottom: 6724,
    },
    {
      src: '2-29',
      height: 384,
      top: 6732,
      bottom: 7116,
    },
    {
      src: '2-30',
      height: 384,
      top: 7124,
      bottom: 7508,
    },
    {
      src: '2-31',
      height: 384,
      top: 7516,
      bottom: 7900,
    },
  ],
] as Readonly<Array<Array<GridItemDataTestVersion>>>;

export const ColumnsInitialMiddle = {
  TopInvisibleColumnsInitialMiddle,
  VisibleColumnsInitialMiddle,
  BottomInvisibleColumnsInitialMiddle,
  ViewportTop: 3240,
  ViewportBottom: 4320,
  VisualViewportHeight: 1080,
} as const;
