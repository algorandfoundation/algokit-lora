import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { AssetResultBuilder } from '../builders/asset-result-builder'

export const assetResultMother = {
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
