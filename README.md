# Presentation

Please click the below thumbnail image (or alternative text in the case there are problems downloading the image) to navigate to the YouTube presentation. (This is necessary because at this time, GitHub doesn't allow for directly embedding a YouTube video.)

[![Presentation Thumbnail](https://i9.ytimg.com/vi_webp/H9MoZ52x2Lk/mq2.webp?sqp=CIipibMG-oaymwEmCMACELQB8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGHIgXyhGMA8=&rs=AOn4CLAVPKLITfolJpEqm7xR1TksPD6bnA)](https://youtu.be/H9MoZ52x2Lk)

# How to run locally

Below are my versions for Yarn, Node, and npm:

- Yarn: 1.22.18
- Node: 20.9.0
- npm: 10.1.0

Install npm dependencies by issuing

```zsh
$ yarn
```

#### Running The Application

To run the application, issue the following:

```zsh
$ yarn dev
```

#### Running The Unit Tests

To run the unit tests, execute the following

```zsh
$ yarn test
```

# Requirements

- As a user, I expect the grid to accommodate different visual viewport widths
  and DPRs as follows:

  - As a user, I expect that the grid centers equal-width columns with an
    8-pixel gap between each adjacent pair.
  - As a user, I expect that the images are responsive. That is, I expect that
    based on the allocated column width and the DPR, the grid determines a set of
    suitable resource URLs, ensuring the correct cropping and resolution. [^1]
    - Note: I haven't had the bandwidth to actually create different cropped
      versions of images. So, I've only achieved the code part of this
      requirement.

- As a user, I expect that a new image is added to the shortest (where the
  height of a column is the distance from the top of viewport to that column's
  bottommost image's bottom) column and if there's a tie, then, to the one
  that's leftmost.

  - Please refer to the video for a visual representation of this.

- As a user, I expect that the visual viewport is always filled unless the
  server has no more images to provide.

- As a user, I expect that the grid's infinitely scrollable.

- As a user, I expect the scrolling to be virtualized:

  - As a bare minimum requirement, I expect that only images that are
    intersecting with the visual viewport are shown:

    - Please refer to the video for a visual representation of this.

  - As a bonus requirement, I expect that for each column, there are _n_
    additional items or buffers completely above and _n_ items or buffers
    completely below the visual viewport that are also shown:

    - Please refer to the video for a visual representation of this.

- As a user, I expect the following two loading indicators:

  - One right at the center of the page before any initial rendering of the
    grid.

  - One right below the tallest column when the server still has more images and
    I've scrolled to the bottom of currently retrieved images.

- As a user, I expect to see a message indicating that there are no more images
  if I've reached the end of the grid and the server has no more images to
  provide.

- As a user, I expect to be able to see the number of times that the subsequent
  loading indicator's been observed because it'll help determine if we need to
  tweak the size of image batches and/or the debounce wait time on the
  scrolling.

- As a user, I expect that some of the images will be advertisement and that
  they're indicated as such by an overlaying text with the following attributes:

  - The overlaying text's vertical alignment is always center.
  - When the width of the image is essentially equal or larger than the text,
    the text is centered horizontally.
  - When the width of the image is essentially less than the text, the text is
    left aligned and truncated with ellipsis.

- As a user, I expect to be notified of advertisements that I've
  scrolled fully into view and that I can track all such advertisements.

- As a developer, I expect for there to be code to help benchmark the
  latency of rendering the initial image batch.

- As a developer, I expect to get some benchmarks around how much the back-end
  can help optimize the initial rendering latency.

# Out of scope

- Back-end implementation is out of scope for this project.

[^1]:
    In front-end development, the part about ensuring the correct cropped
    version is referred to as the art direction problem and the part about
    ensuring the correct resolution version is referred to as the resolution
    switching problem [[reference](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)].
