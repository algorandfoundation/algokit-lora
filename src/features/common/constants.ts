export const ZERO_ADDRESS = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ'
// The default limit when we fetch data from the indexer
// We chose 100 because:
//   - In most places, we use page size 10, 20, 30, 40, 50. 100 items will give us at least 2 pages of data.
//   - 100 is small enough to not cause performance issues.
//     For example, for the account EXECUTOREZZDJN3NFLVZNXE7UZKCERNFC6FD7SBXMVKASKRF4ZASJKN5BE
//     the response size of fetching 100 items is 180Kb (Gzipped), which is ok.
//     if we up it to 200, the response is 400Kb and can cause performance issues.
export const DEFAULT_FETCH_SIZE = 200
