export function clone2DArrayNaive<T>(
  nested: Array<Array<T>> | Readonly<Array<Array<T>>>,
): Array<Array<T>> {
  return nested.map((inner) => [...inner]);
}
