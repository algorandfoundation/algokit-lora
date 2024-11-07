export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunkedArray: T[][] = []
  let i = 0

  while (i < array.length) {
    chunkedArray.push(array.slice(i, (i += chunkSize)))
  }

  return chunkedArray
}
