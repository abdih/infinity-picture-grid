/**
 * Compute the height of a provided image when it's scaled, while preserving
 * aspect ratio, to match the provided width.
 * @param {string} src
 * @param {number} width
 * @returns {number} The aforementioned height.
 */
export function getImageHeightScaled(
  src: string,
  width: number,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const height = image.height * (width / image.width);
      resolve(height);
    };
    image.onerror = () => {
      reject();
    };
    image.src = src;
  });
}
