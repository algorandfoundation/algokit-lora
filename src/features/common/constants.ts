export const ZERO_ADDRESS = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ'
// The default limit when we fetch data from the indexer
// We chose 200 because:
//   - In most places, we use page size 10, 20, 30, 40, 50, 100. 200 items should give us at least 2 pages of data.
//   - 200 is really the max value to not cause load performance issues.
//     For example, for the account EXECUTOREZZDJN3NFLVZNXE7UZKCERNFC6FD7SBXMVKASKRF4ZASJKN5BE
//     the response size of fetching 200 items is approx 400Kb (Gzipped), which is quite a bit of data.
export const DEFAULT_FETCH_SIZE = 200
export const LORA_URI_SCHEME = 'algokit-lora'
