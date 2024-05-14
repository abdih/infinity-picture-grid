export function randomSelect<T extends unknown>(array: Array<T>): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function conductBernoulliTrial(successProbability: number): boolean {
  return Math.random() <= successProbability;
}
