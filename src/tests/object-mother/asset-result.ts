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
  ['mainnet-312769']: () => {
    const encoder = new TextEncoder()
    return new AssetResultBuilder({
      index: 312769,
      params: {
        clawback: 'XIU7HGGAJ3QOTATPDSIIHPFVKMICXKHMOR2FJKHTVLII4FAOA3CYZQDLG4',
        creator: 'XIU7HGGAJ3QOTATPDSIIHPFVKMICXKHMOR2FJKHTVLII4FAOA3CYZQDLG4',
        decimals: 6,
        'default-frozen': false,
        freeze: 'XIU7HGGAJ3QOTATPDSIIHPFVKMICXKHMOR2FJKHTVLII4FAOA3CYZQDLG4',
        manager: 'XIU7HGGAJ3QOTATPDSIIHPFVKMICXKHMOR2FJKHTVLII4FAOA3CYZQDLG4',
        name: 'Tether USDt',
        'name-b64': encoder.encode('VGV0aGVyIFVTRHQ='),
        reserve: 'XIU7HGGAJ3QOTATPDSIIHPFVKMICXKHMOR2FJKHTVLII4FAOA3CYZQDLG4',
        total: 18446744073709552000,
        'unit-name': 'USDt',
        'unit-name-b64': encoder.encode('VVNEdA=='),
        url: 'tether.to',
        'url-b64': encoder.encode('dGV0aGVyLnRv'),
      },
    } satisfies AssetResult)
  },
  ['testnet-642327435']: () => {
    const encoder = new TextEncoder()
    return new AssetResultBuilder({
      index: 642327435,
      params: {
        clawback: 'ATJJRFAQVMD3YVX47HZLK2GRNKZLS3YDRLJ62JJPLUCZPDJE7QPQZDTVGY',
        creator: 'ATJJRFAQVMD3YVX47HZLK2GRNKZLS3YDRLJ62JJPLUCZPDJE7QPQZDTVGY',
        decimals: 0,
        'default-frozen': false,
        freeze: 'ATJJRFAQVMD3YVX47HZLK2GRNKZLS3YDRLJ62JJPLUCZPDJE7QPQZDTVGY',
        manager: 'ATJJRFAQVMD3YVX47HZLK2GRNKZLS3YDRLJ62JJPLUCZPDJE7QPQZDTVGY',
        name: 'ASA $11_$28_$100',
        'name-b64': encoder.encode('QVNBICQxMV8kMjhfJDEwMA=='),
        reserve: 'ATJJRFAQVMD3YVX47HZLK2GRNKZLS3YDRLJ62JJPLUCZPDJE7QPQZDTVGY',
        total: 100,
        url: 'https://path/to/my/asset/details',
        'url-b64': encoder.encode('aHR0cHM6Ly9wYXRoL3RvL215L2Fzc2V0L2RldGFpbHM='),
      },
    } satisfies AssetResult)
  },
  ['mainnet-971381860']: () => {
    const encoder = new TextEncoder()
    return new AssetResultBuilder({
      index: 971381860,
      params: {
        creator: '2ZPNLKXWCOUJ2ONYWZEIWOUYRXL36VCIBGJ4ZJ2AAGET5SIRTHKSNFDJJ4',
        decimals: 6,
        'default-frozen': false,
        name: 'Folks V2 Algo',
        'name-b64': encoder.encode('Rm9sa3MgVjIgQWxnbw=='),
        reserve: '2ZPNLKXWCOUJ2ONYWZEIWOUYRXL36VCIBGJ4ZJ2AAGET5SIRTHKSNFDJJ4',
        total: 10000000000000000,
        'unit-name': 'fALGO',
        'unit-name-b64': encoder.encode('ZkFMR08='),
      },
    } satisfies AssetResult)
  },
}
