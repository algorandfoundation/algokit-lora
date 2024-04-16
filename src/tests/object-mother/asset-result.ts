import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { AssetResultBuilder } from '../builders/asset-result-builder'

export const assetResultMother = {
  ['mainnet-140479105']: () => {
    const encoder = new TextEncoder()
    return new AssetResultBuilder({
      index: 140479105,
      params: {
        clawback: 'LINTQTVHWUFZR677Z6GD3MTVWEXDX26Z2V7Q7QSD6NOQ6WOZTMSIMYCQE4',
        creator: 'LINTQTVHWUFZR677Z6GD3MTVWEXDX26Z2V7Q7QSD6NOQ6WOZTMSIMYCQE4',
        decimals: 2,
        'default-frozen': false,
        freeze: 'LINTQTVHWUFZR677Z6GD3MTVWEXDX26Z2V7Q7QSD6NOQ6WOZTMSIMYCQE4',
        manager: 'LINTQTVHWUFZR677Z6GD3MTVWEXDX26Z2V7Q7QSD6NOQ6WOZTMSIMYCQE4',
        name: 'Clyders',
        'name-b64': encoder.encode('Q2x5ZGVycw=='),
        reserve: 'LINTQTVHWUFZR677Z6GD3MTVWEXDX26Z2V7Q7QSD6NOQ6WOZTMSIMYCQE4',
        total: 1000000000,
        'unit-name': 'CLY',
        'unit-name-b64': encoder.encode('Q0xZ'),
        url: 'https://www.joinclyde.com/',
        'url-b64': encoder.encode('aHR0cHM6Ly93d3cuam9pbmNseWRlLmNvbS8='),
      },
    } satisfies AssetResult)
  },
  ['mainnet-523683256']: () => {
    const encoder = new TextEncoder()
    return new AssetResultBuilder({
      index: 523683256,
      params: {
        creator: 'QUUQHH4HJ3FHUWMKTKFBUA72XTSW6F7YLLTRI7FWENJBKQYWTESSCZPQLU',
        decimals: 6,
        'default-frozen': false,
        manager: 'QUUQHH4HJ3FHUWMKTKFBUA72XTSW6F7YLLTRI7FWENJBKQYWTESSCZPQLU',
        name: 'AKITA INU',
        'name-b64': encoder.encode('QUtJVEEgSU5V'),
        reserve: 'QUUQHH4HJ3FHUWMKTKFBUA72XTSW6F7YLLTRI7FWENJBKQYWTESSCZPQLU',
        total: 1000000000000000,
        'unit-name': 'AKTA',
        'unit-name-b64': encoder.encode('QUtUQQ=='),
        url: 'https://akita.community/',
        'url-b64': encoder.encode('aHR0cHM6Ly9ha2l0YS5jb21tdW5pdHkv'),
      },
    } satisfies AssetResult)
  },
}
