export function clone2DArrayNaive<T>(nested: Array<Array<T>>): Array<Array<T>> {
  const clone: Array<Array<T>> = [];

  for (let i = 0; i < nested.length; i++) {
    clone.push([...nested[i]]);
  }

  return clone;
}
