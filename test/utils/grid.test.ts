import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import {
  blankColumns,
  ensureVirtualizationBuffer,
  feedBottomInvisibleFromVisible,
  feedDownFromTopInvisible,
  feedTopInvisibleFromVisible,
  feedUpFromBottomInvisible,
  findNextPlacementData,
  GridItemData,
  placeNewImagesWithoutVirtualization,
} from '@/utils/grid';
import { ColumnsInitialMiddle, srcToHeightMapping } from '@test/.fixtures/grid';
import { clone2DArrayNaive } from '@/utils/array';
import { NextBatchImageData } from '@/api-clients/image';
import { getImageHeightScaled } from '@/utils/image';
import { range } from 'lodash';
import { GridItemDataTestVersion } from '@test/test-utils/grid-generate';

vi.mock('@/utils/image', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/utils/image')>();
  return {
    ...module,
    getImageHeightScaled: vi.spyOn(module, 'getImageHeightScaled'),
  };
});

describe('findNextPlacementData', () => {
  describe('Visible columns are exhausted', () => {
    test('Selects topmost', () => {
      const visibleColumns: Array<Array<GridItemData>> = [
        [{ top: 0, height: 1080, src: '' }],
        [{ top: 0, height: 1080, src: '' }],
        [{ top: 0, height: 1080, src: '' }],
      ];

      const bottomInvisibleColumns: Array<Array<GridItemData>> = [
        [{ top: 1088, height: 200, src: '' }],
        [{ top: 1088, height: 100, src: '' }],
        [{ top: 1088, height: 300, src: '' }],
      ];

      const GapAmount = 8;

      const expected = {
        index: 1,
        top: 1196,
      };

      const actual = findNextPlacementData({
        visibleColumns,
        bottomInvisibleColumns,
        GapAmount,
      });

      expect(expected).toEqual(actual);
    });

    test('Breaks ties by selecting leftmost', () => {
      const visibleColumns: Array<Array<GridItemData>> = [
        [{ top: 0, height: 1080, src: '' }],
        [{ top: 0, height: 1080, src: '' }],
        [{ top: 0, height: 1080, src: '' }],
      ];

      const bottomInvisibleColumns: Array<Array<GridItemData>> = [
        [{ top: 1088, height: 400, src: '' }],
        [{ top: 1088, height: 400, src: '' }],
        [{ top: 1088, height: 400, src: '' }],
      ];

      const GapAmount = 8;

      const expected = {
        index: 0,
        top: 1496,
      };

      const actual = findNextPlacementData({
        visibleColumns,
        bottomInvisibleColumns,
        GapAmount,
      });

      expect(actual).toEqual(expected);
    });
  });

  describe('Visible columns are not exhausted', () => {
    test('Selects topmost', () => {
      const visibleColumns: Array<Array<GridItemData>> = [
        [{ top: 0, height: 400, src: '' }],
        [{ top: 0, height: 1080, src: '' }],
        [{ top: 0, height: 1080, src: '' }],
      ];

      const bottomInvisibleColumns: Array<Array<GridItemData>> = [
        [],
        [{ top: 1088, height: 100, src: '' }],
        [{ top: 1088, height: 300, src: '' }],
      ];

      const GapAmount = 8;

      const expected = {
        index: 0,
        top: 408,
      };

      const actual = findNextPlacementData({
        visibleColumns,
        bottomInvisibleColumns,
        GapAmount,
      });

      expect(expected).toEqual(actual);
    });

    test('Breaks ties by selecting leftmost', () => {
      const visibleColumns: Array<Array<GridItemData>> = [
        [{ top: 0, height: 400, src: '' }],
        [{ top: 0, height: 1080, src: '' }],
        [{ top: 0, height: 400, src: '' }],
      ];

      const bottomInvisibleColumns: Array<Array<GridItemData>> = [
        [],
        [{ top: 1088, height: 400, src: '' }],
        [],
      ];

      const GapAmount = 8;

      const expected = {
        index: 0,
        top: 408,
      };

      const actual = findNextPlacementData({
        visibleColumns,
        bottomInvisibleColumns,
        GapAmount,
      });

      expect(actual).toEqual(expected);
    });
  });
});

describe('placeNewImagesWithoutVirtualization', async () => {
  // Reminder: `placeNewImagesWithoutVirtualization` always appends a new item
  // from `imagesData` to a bottom invisible column even if the current visual
  // viewport corresponds with available space in the visible columns. Ergo,
  // this is why `feedTopInvisibleFromVisible` and `feedUpFromBottomInvisible`
  // are currently called subsequently.

  beforeAll(() => {
    vi.mocked(getImageHeightScaled).mockImplementation(
      async (src: string, _width: number) => {
        return Promise.resolve(
          srcToHeightMapping[src as keyof typeof srcToHeightMapping],
        );
      },
    );
  });

  afterAll(() => {
    vi.mocked(getImageHeightScaled).mockRestore;
  });

  // Unsure of what an optimal generic cases breakdown is at the moment for
  // `placeNewImagesWithoutVirtualization`, but the following two cases based on
  // the reference grid seem helpful.

  describe('Current grid has nothing in bottom invisible columns', () => {
    test('Current grid is the reference grid but only items that have a part within the initial visual viewport (i.e., 0 <= top <= 1789):', async () => {
      // Reminder that our reference grid is with respect to a visual viewport
      // with a height of 1080. So, our visible columns doesn't have anything
      // from the reference grid whose "top" is below 1080.
      const visibleColumns = [
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
        ],
      ];

      const bottomInvisibleColumns = [[], [], []];

      const matchingSupportedCssPixelWidth = 256;

      const matchingSupportedDpr = 1;

      // The next chronological items according to the reference grid are as
      // follows for the columns:
      //
      //   - 0th column: { src: '0-4', height: 384, top: 1163 }
      //   - 1st column: { src: '1-5', height: 171, top: 1091 }
      //   - 2nd column: { src: '2-5', height: 171, top: 1261 }
      //
      // Ascendingly ordering them based on their "top" value gives us the
      // desired ordering for `imagesData`:

      const imagesData = [
        {
          srcs: new Map([
            [
              matchingSupportedCssPixelWidth,
              new Map([[matchingSupportedDpr, '1-5']]),
            ],
          ]),
        },
        {
          srcs: new Map([
            [
              matchingSupportedCssPixelWidth,
              new Map([[matchingSupportedDpr, '0-4']]),
            ],
          ]),
        },
        {
          srcs: new Map([
            [
              matchingSupportedCssPixelWidth,
              new Map([[matchingSupportedDpr, '2-5']]),
            ],
          ]),
        },
      ] as Array<NextBatchImageData>;

      const visibleColumnsBefore = clone2DArrayNaive(visibleColumns);
      const bottomInvisibleColumnsBefore = clone2DArrayNaive(
        bottomInvisibleColumns,
      );

      await placeNewImagesWithoutVirtualization({
        imagesData,
        bottomInvisibleColumns,
        visibleColumns,
        GapAmount: 8,
        // `columnWidth` is irrelevant given our mock of `getImageHeightScaled`.
        columnWidth: 0,
        matchingSupportedCssPixelWidth,
        matchingSupportedDpr,
      });

      // Expect that visible columns didn't change
      expect(visibleColumns).toEqual(visibleColumnsBefore);

      // Items (e.g., that of item with `src` = "0-5") are directly from the
      // reference grid.
      expect(bottomInvisibleColumns).toEqual([
        [
          ...bottomInvisibleColumnsBefore[0],
          {
            src: '0-4',
            height: 384,
            top: 1163,
          },
        ],
        [
          ...bottomInvisibleColumnsBefore[1],
          {
            src: '1-5',
            height: 171,
            top: 1091,
          },
        ],
        [
          ...bottomInvisibleColumnsBefore[2],
          {
            src: '2-5',
            height: 171,
            top: 1261,
          },
        ],
      ]);

      // Expect that bottom invisible columns changed
    });
  });

  describe('Current grid has at least one item in each of the bottom invisible columns', () => {
    test(`Current grid is the reference grid but where each column has only items up to and including the first item whose top is below the initial visual viewport (i.e., equal to or below 1080):`, async () => {
      // Note: This is the ending state of the "Current grid is the reference
      // grid but only items that have a part within the initial visual viewport
      // (i.e., 0 <= top <= 1789)" case.

      const visibleColumns = [
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
        ],
      ];

      const bottomInvisibleColumns = [
        [
          {
            src: '0-4',
            height: 384,
            top: 1163,
          },
        ],
        [
          {
            src: '1-5',
            height: 171,
            top: 1091,
          },
        ],
        [
          {
            src: '2-5',
            height: 171,
            top: 1261,
          },
        ],
      ];

      const matchingSupportedCssPixelWidth = 256;

      const matchingSupportedDpr = 1;

      // The next chronological items according to the reference grid are as
      // follows for the columns:
      //
      //   - 0th column: { src: '0-5', height: 384, top: 1555 }
      //   - 1st column: { src: '1-6', height: 384, top: 1270 }
      //   - 2nd column: { src: '2-6', height: 192, top: 1440 }
      //
      // Ascendingly ordering them based on their "top" value gives us the
      // desired ordering for `imagesData`:

      const imagesData = [
        {
          srcs: new Map([
            [
              matchingSupportedCssPixelWidth,
              new Map([[matchingSupportedDpr, '1-6']]),
            ],
          ]),
        },
        {
          srcs: new Map([
            [
              matchingSupportedCssPixelWidth,
              new Map([[matchingSupportedDpr, '2-6']]),
            ],
          ]),
        },
        {
          srcs: new Map([
            [
              matchingSupportedCssPixelWidth,
              new Map([[matchingSupportedDpr, '0-5']]),
            ],
          ]),
        },
      ] as Array<NextBatchImageData>;

      const visibleColumnsBefore = clone2DArrayNaive(visibleColumns);
      const bottomInvisibleColumnsBefore = clone2DArrayNaive(
        bottomInvisibleColumns,
      );

      await placeNewImagesWithoutVirtualization({
        imagesData,
        bottomInvisibleColumns,
        visibleColumns,
        GapAmount: 8,
        // `columnWidth` is irrelevant given our mock of `getImageHeightScaled`.
        columnWidth: 0,
        matchingSupportedCssPixelWidth,
        matchingSupportedDpr,
      });

      // Expect that visible columns didn't change
      expect(visibleColumns).toEqual(visibleColumnsBefore);

      // Items (e.g., that of item with `src` = "0-5") are directly from the
      // reference grid.
      expect(bottomInvisibleColumns).toEqual([
        [
          ...bottomInvisibleColumnsBefore[0],
          {
            src: '0-5',
            height: 384,
            top: 1555,
          },
        ],
        [
          ...bottomInvisibleColumnsBefore[1],
          {
            src: '1-6',
            height: 384,
            top: 1270,
          },
        ],
        [
          ...bottomInvisibleColumnsBefore[2],
          {
            src: '2-6',
            height: 192,
            top: 1440,
          },
        ],
      ]);

      // Expect that bottom invisible columns changed
    });
  });
});

describe('feedBottomInvisibleFromVisible', () => {
  // Should be the mirror of feedTopInvisibleFromVisible

  const globalScrollYInitial = global.scrollY;
  afterEach(() => {
    global.scrollY = globalScrollYInitial;
  });

  // Cases:
  //   1. Nothing changes.
  //   2. Bottom invisible section gets an item (or items) from the visible
  //   section.

  describe('Case 1: Nothing changes', () => {
    test(`The buffer item of a visible column that only has that buffer item doesn't move into the respective bottom invisible column`, () => {
      // The motivation for this test case is to prevent regression towards a
      // previous problematic implementation that resulted in a bug similar to
      // this test case. The implementation would move an item down from the
      // visible column into the respective bottom invisible column if the
      // bottommost item in the visible column wasn't intersecting the visual
      // viewport anymore, instead of specifically checking that the item was
      // below the visual viewport. So, a bottommost item that wasn't
      // intersecting the visual viewport but that was above the visual viewport
      // would be moved into the respective bottom invisible column. This
      // problem wouldn't arise if we didn't have buffers.

      const visualViewportHeight = 254;

      // Simulating a scroll up from the previous scrollY being
      // visualViewportHeight
      global.scrollY = visualViewportHeight - 10;

      const originalVisibleColumns = [
        [
          {
            src: '0-0',
            height: 127,
            top: 0,
            bottom: 127,
          },
        ],
        [
          {
            src: '1-0',
            height: 381,
            top: 0,
            bottom: 381,
          },
        ],
        [
          {
            src: '2-0',
            height: 127,
            top: 0,
            bottom: 127,
          },
        ],
      ];

      const originalBottomInvisibleColumns =
        blankColumns<GridItemDataTestVersion>(originalVisibleColumns.length);

      const updatedVisibleColumns = clone2DArrayNaive(originalVisibleColumns);

      const bottomInvisibleColumns = clone2DArrayNaive(
        originalBottomInvisibleColumns,
      );

      feedBottomInvisibleFromVisible({
        updatedVisibleColumns,
        bottomInvisibleColumns,
        visualViewportHeight: ColumnsInitialMiddle.VisualViewportHeight,
      });

      expect(updatedVisibleColumns).toEqual(originalVisibleColumns);
      expect(bottomInvisibleColumns).toEqual(originalBottomInvisibleColumns);
    });
  });

  test('Case 2: Bottom invisible section gets an item (or items) from the visible section.', async () => {
    // Going to simulate scrolling up 2 * visualViewportHeight.
    global.scrollY =
      ColumnsInitialMiddle.ViewportTop -
      2 * ColumnsInitialMiddle.VisualViewportHeight; // = 1080

    const visibleColumns = clone2DArrayNaive(
      ColumnsInitialMiddle.VisibleColumnsInitialMiddle,
    );
    const bottomInvisibleColumns = clone2DArrayNaive(
      ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle,
    );

    feedBottomInvisibleFromVisible({
      updatedVisibleColumns: visibleColumns,
      bottomInvisibleColumns,
      visualViewportHeight: ColumnsInitialMiddle.VisualViewportHeight,
    });

    // Reminder:
    //
    // New visual viewport's top is 1080 and bottom is 2160

    const expectedVisibleColumns = [[], [], []];

    const expectedBottomInvisibleColumns = [
      [
        ...ColumnsInitialMiddle.VisibleColumnsInitialMiddle[0],
        ...ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle[0],
      ],
      [
        ...ColumnsInitialMiddle.VisibleColumnsInitialMiddle[1],
        ...ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle[1],
      ],
      [
        ...ColumnsInitialMiddle.VisibleColumnsInitialMiddle[2],
        ...ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle[2],
      ],
    ];

    expect(visibleColumns).toEqual(expectedVisibleColumns);
    expect(bottomInvisibleColumns).toEqual(expectedBottomInvisibleColumns);
  });
});

describe('feedDownFromTopInvisible', () => {
  // Should be the mirror of feedUpFromBottomInvisible

  const globalScrollYInitial = global.scrollY;
  afterEach(() => {
    global.scrollY = globalScrollYInitial;
  });

  // Cases:
  //   1. Nothing changes.
  //   2. The only item exchange(s) is (are) from the top invisible section
  //   directly to the bottom invisible section.
  //   3. The only item exchange(s) is (are) from the top invisible section to
  //   the visible section.
  //   4. There are item exchanges from the top invisible section to both
  //   the visible and bottom invisible sections.

  test('Case 4: There are both things that go from top invisible to visible and to bottom invisible.', () => {
    // Going to simulate scrolling up 2 * visualViewportHeight.
    global.scrollY =
      ColumnsInitialMiddle.ViewportTop -
      2 * ColumnsInitialMiddle.VisualViewportHeight; // = 1080

    // Expect that `feedBottomInvisibleFromVisible` has run by the time that
    // `feedDownFromTopInvisible` is executed.
    const visibleColumns = [[], [], []];
    const topInvisibleColumns = clone2DArrayNaive(
      ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle,
    );
    const bottomInvisibleColumns = clone2DArrayNaive(
      ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle,
    );

    feedDownFromTopInvisible({
      updatedVisibleColumns: visibleColumns,
      topInvisibleColumns,
      bottomInvisibleColumns,
      visualViewportHeight: ColumnsInitialMiddle.VisualViewportHeight,
    });

    // Reminder:
    //
    // New visual viewport's top is 1080 and bottom is 2160

    const expectedTopInvisibleColumns = [
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
      ],
    ];

    // Reminder that items in visible columns still remain; ergo, the need
    // for feedBottomInvisibleFromVisible after in application logic
    const expectedVisibleColumns = [
      [
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
      ],
      [
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
      ],
      [
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
      ],
    ];

    // Reminder that the only additions to the head of bottom invisible columns
    // are those from top invisible columns. Ergo, the need to call
    // subsequently call feedBottomInvisibleFromVisible in the application
    // logic
    const expectedBottomInvisibleColumns = [
      [
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
        ...ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle[0],
      ],
      [
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
        ...ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle[1],
      ],
      [
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
        ...ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle[2],
      ],
    ];

    expect(topInvisibleColumns).toEqual(expectedTopInvisibleColumns);
    expect(visibleColumns).toEqual(expectedVisibleColumns);
    expect(bottomInvisibleColumns).toEqual(expectedBottomInvisibleColumns);
  });
});

describe('feedTopInvisibleFromVisible', () => {
  // Should be the mirror of feedBottomInvisibleFromVisible

  const globalScrollYInitial = global.scrollY;
  afterEach(() => {
    global.scrollY = globalScrollYInitial;
  });

  // Cases:
  //   1. Nothing changes.
  //   2. Top invisible section gets an item (or items) from the visible
  //   section.

  // Regarding Case 1, currently not adding a counterpart test to the one
  // for feedBottomInvisibleFromVisible for ensuring that a bottom buffer
  // doesn't go into a top invisible column because it doesn't seem like there's
  // a real-life case where this would happen given that we're populating the
  // grid from top down.

  test('Case 2: Bottom invisible section gets an item (or items) from the visible section.', async () => {
    // Going to simulate scrolling down 2 * visualViewportHeight.
    global.scrollY =
      ColumnsInitialMiddle.ViewportTop +
      2 * ColumnsInitialMiddle.VisualViewportHeight; // = 5400

    const visibleColumns = clone2DArrayNaive(
      ColumnsInitialMiddle.VisibleColumnsInitialMiddle,
    );
    const topInvisibleColumns = clone2DArrayNaive(
      ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle,
    );

    feedTopInvisibleFromVisible({
      updatedVisibleColumns: visibleColumns,
      topInvisibleColumns,
    });

    // Reminder:
    //
    // New visual viewport's top is 5400 and bottom is 6480

    const expectedVisibleColumns = [[], [], []];

    const expectedTopInvisibleColumns = [
      [
        ...ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle[0],
        ...ColumnsInitialMiddle.VisibleColumnsInitialMiddle[0],
      ],
      [
        ...ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle[1],
        ...ColumnsInitialMiddle.VisibleColumnsInitialMiddle[1],
      ],
      [
        ...ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle[2],
        ...ColumnsInitialMiddle.VisibleColumnsInitialMiddle[2],
      ],
    ];

    expect(visibleColumns).toEqual(expectedVisibleColumns);
    expect(topInvisibleColumns).toEqual(expectedTopInvisibleColumns);
  });
});

describe('feedUpFromBottomInvisible', () => {
  // Should be the mirror of feedDownFromTopInvisible

  const globalScrollYInitial = global.scrollY;
  afterEach(() => {
    global.scrollY = globalScrollYInitial;
  });

  // Cases:
  //   1. Nothing changes.
  //   2. The only item exchange(s) is (are) from the bottom invisible section
  //   directly to the top invisible section.
  //   3. The only item exchange(s) is (are) from the bottom invisible section
  //   to the visible section.
  //   4. There are item exchanges from the bottom invisible section to both
  //   the visible and top invisible sections.

  test('Case 4: There are both things that go from top invisible to visible and to bottom invisible.', () => {
    // Going to simulate scrolling down 2 * visualViewportHeight.
    global.scrollY =
      ColumnsInitialMiddle.ViewportTop +
      2 * ColumnsInitialMiddle.VisualViewportHeight; // = 5400

    // Expect that `feedTopInvisibleFromVisible` has run by the time that
    // `feedUpFromBottomInvisible` has been invoked.
    const visibleColumns = [[], [], []];
    const topInvisibleColumns = clone2DArrayNaive(
      ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle,
    );
    const bottomInvisibleColumns = clone2DArrayNaive(
      ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle,
    );

    feedUpFromBottomInvisible({
      updatedVisibleColumns: visibleColumns,
      topInvisibleColumns,
      bottomInvisibleColumns,
      visualViewportHeight: ColumnsInitialMiddle.VisualViewportHeight,
    });

    // Reminder:
    //
    // New visual viewport's top is 5400 and bottom is 6480

    const expectedTopInvisibleColumns = [
      [
        ...ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle[0],
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
      ],
      [
        ...ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle[1],
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
      ],
      [
        ...ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle[2],
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
      ],
    ];

    // Reminder that items in visible columns still remain; ergo, the need
    // for feedTopInvisibleFromVisible after in application logic
    const expectedVisibleColumns = [
      [
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
      ],
      [
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
      ],
      [
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
      ],
    ];

    // Reminder that the only additions to the head of bottom invisible columns
    // are those from top invisible columns. Ergo, the need to call
    // subsequently call feedBottomInvisibleFromVisible in the application
    // logic
    const expectedBottomInvisibleColumns = [
      [
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
    ];

    expect(topInvisibleColumns).toEqual(expectedTopInvisibleColumns);
    expect(visibleColumns).toEqual(expectedVisibleColumns);
    expect(bottomInvisibleColumns).toEqual(expectedBottomInvisibleColumns);
  });
});

describe('ensureVirtualizationBuffer', () => {
  const globalScrollYInitial = global.scrollY;
  const buffer = 3;

  afterEach(() => {
    global.scrollY = globalScrollYInitial;
  });

  test('Given a grid with no buffering, adds appropriate buffering', () => {
    global.scrollY = ColumnsInitialMiddle.ViewportTop;

    // Starting grid
    const visibleColumns = clone2DArrayNaive(
      ColumnsInitialMiddle.VisibleColumnsInitialMiddle,
    );
    const bottomInvisibleColumns = clone2DArrayNaive(
      ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle,
    );
    const topInvisibleColumns = clone2DArrayNaive(
      ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle,
    );

    ensureVirtualizationBuffer({
      updatedVisibleColumns: visibleColumns,
      topInvisibleColumns,
      bottomInvisibleColumns,
      buffer,
      visualViewportHeight: ColumnsInitialMiddle.VisualViewportHeight,
    });

    // Arbitrarily choosing visible columns
    const columnCount = visibleColumns.length;

    expect(visibleColumns).toEqual(
      range(columnCount).map((columnIndex) => {
        return [
          ...ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle[
            columnIndex
          ].slice(-buffer),
          ...ColumnsInitialMiddle.VisibleColumnsInitialMiddle[columnIndex],
          ...ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle[
            columnIndex
          ].slice(0, buffer),
        ];
      }),
    );

    expect(bottomInvisibleColumns).toEqual(
      range(columnCount).map((columnIndex) => {
        return [
          ...ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle[
            columnIndex
          ].slice(buffer),
        ];
      }),
    );

    expect(topInvisibleColumns).toEqual(
      range(columnCount).map((columnIndex) => {
        return [
          ...ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle[
            columnIndex
          ].slice(0, -buffer),
        ];
      }),
    );
  });

  describe('Given a grid that already has full buffering, does not extraneously add buffering while scrolling', () => {
    // Arbitrarily choosing ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle
    const columnCount =
      ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle.length;

    // Note, the starting condition is the resulting condition of the
    // "Given a grid with no buffering, adds appropriate buffering" case.

    const VisibleColumns = range(columnCount).map((columnIndex) => {
      return [
        ...ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle[
          columnIndex
        ].slice(-buffer),
        ...ColumnsInitialMiddle.VisibleColumnsInitialMiddle[columnIndex],
        ...ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle[
          columnIndex
        ].slice(0, buffer),
      ];
    }) as Readonly<typeof ColumnsInitialMiddle.VisibleColumnsInitialMiddle>;

    const BottomInvisibleColumns = range(columnCount).map((columnIndex) => {
      return [
        ...ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle[
          columnIndex
        ].slice(buffer),
      ];
    }) as Readonly<
      typeof ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle
    >;

    const TopInvisibleColumns = range(columnCount).map((columnIndex) => {
      return [
        ...ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle[
          columnIndex
        ].slice(0, -buffer),
      ];
    }) as Readonly<
      typeof ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle
    >;

    function ensureGridWithoutBuffersRemainsSame(
      updateGridSections: ({
        topInvisibleColumnsUpdated,
        visibleColumnsUpdated,
        bottomInvisibleColumnsUpdated,
      }: {
        topInvisibleColumnsUpdated: GridItemDataTestVersion[][];
        visibleColumnsUpdated: GridItemDataTestVersion[][];
        bottomInvisibleColumnsUpdated: GridItemDataTestVersion[][];
      }) => void,
    ) {
      // `*Updated` variables are added to separately track changes.

      const visibleColumnsUpdated = clone2DArrayNaive(
        ColumnsInitialMiddle.VisibleColumnsInitialMiddle,
      );
      const bottomInvisibleColumnsUpdated = clone2DArrayNaive(
        ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle,
      );
      const topInvisibleColumnsUpdated = clone2DArrayNaive(
        ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle,
      );

      updateGridSections({
        topInvisibleColumnsUpdated,
        visibleColumnsUpdated,
        bottomInvisibleColumnsUpdated,
      });

      expect(topInvisibleColumnsUpdated).toEqual(
        clone2DArrayNaive(
          ColumnsInitialMiddle.TopInvisibleColumnsInitialMiddle,
        ),
      );
      expect(visibleColumnsUpdated).toEqual(
        clone2DArrayNaive(ColumnsInitialMiddle.VisibleColumnsInitialMiddle),
      );
      expect(bottomInvisibleColumnsUpdated).toEqual(
        clone2DArrayNaive(
          ColumnsInitialMiddle.BottomInvisibleColumnsInitialMiddle,
        ),
      );
    }

    // Given that VisibleColumns, TopInvisibleColumns, and
    // BottomInvisibleColumns are fully buffered, we expect that applying
    // `ensureVirtualizationBuffer` doesn't lead to any changes.
    function ensureExtraneousBuffersNotAdded() {
      // `*After` variables are introduced to separately track changes.

      const visibleColumnsAfter = clone2DArrayNaive(VisibleColumns);
      const topInvisibleColumnsAfter = clone2DArrayNaive(TopInvisibleColumns);
      const bottomInvisibleColumnsAfter = clone2DArrayNaive(
        BottomInvisibleColumns,
      );

      ensureVirtualizationBuffer({
        updatedVisibleColumns: visibleColumnsAfter,
        topInvisibleColumns: topInvisibleColumnsAfter,
        bottomInvisibleColumns: bottomInvisibleColumnsAfter,
        buffer,
        visualViewportHeight: ColumnsInitialMiddle.VisualViewportHeight,
      });

      expect(visibleColumnsAfter).toEqual(VisibleColumns);
      expect(topInvisibleColumnsAfter).toEqual(TopInvisibleColumns);
      expect(bottomInvisibleColumnsAfter).toEqual(BottomInvisibleColumns);
    }

    test('Scrolling down', () => {
      // Scroll down just a smidge
      global.scrollY = ColumnsInitialMiddle.ViewportTop + 1;

      ensureGridWithoutBuffersRemainsSame(
        ({
          topInvisibleColumnsUpdated,
          visibleColumnsUpdated,
          bottomInvisibleColumnsUpdated,
        }) => {
          feedTopInvisibleFromVisible({
            updatedVisibleColumns: visibleColumnsUpdated,
            topInvisibleColumns: topInvisibleColumnsUpdated,
          });
          feedUpFromBottomInvisible({
            updatedVisibleColumns: visibleColumnsUpdated,
            topInvisibleColumns: topInvisibleColumnsUpdated,
            bottomInvisibleColumns: bottomInvisibleColumnsUpdated,
            visualViewportHeight: ColumnsInitialMiddle.VisualViewportHeight,
          });
        },
      );

      ensureExtraneousBuffersNotAdded();
    });

    test('Scrolling up', () => {
      // Scroll up just a smidge
      global.scrollY = ColumnsInitialMiddle.ViewportTop - 1;

      ensureGridWithoutBuffersRemainsSame(
        ({
          topInvisibleColumnsUpdated,
          visibleColumnsUpdated,
          bottomInvisibleColumnsUpdated,
        }) => {
          feedBottomInvisibleFromVisible({
            updatedVisibleColumns: visibleColumnsUpdated,
            bottomInvisibleColumns: bottomInvisibleColumnsUpdated,
            visualViewportHeight: ColumnsInitialMiddle.VisualViewportHeight,
          });
          feedDownFromTopInvisible({
            updatedVisibleColumns: visibleColumnsUpdated,
            topInvisibleColumns: topInvisibleColumnsUpdated,
            bottomInvisibleColumns: bottomInvisibleColumnsUpdated,
            visualViewportHeight: ColumnsInitialMiddle.VisualViewportHeight,
          });
        },
      );

      ensureExtraneousBuffersNotAdded();
    });
  });
});
