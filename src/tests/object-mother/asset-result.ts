import { AssetResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { AssetResultBuilder } from '../builders/asset-result-builder'

const encoder = new TextEncoder()

export const assetResultMother = {
  ['mainnet-140479105']: () => {
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
  ['mainnet-31566704']: () => {
    return new AssetResultBuilder({
      index: 31566704,
      params: {
        creator: '2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM',
        decimals: 6,
        'default-frozen': false,
        freeze: '3ERES6JFBIJ7ZPNVQJNH2LETCBQWUPGTO4ROA6VFUR25WFSYKGX3WBO5GE',
        manager: '37XL3M57AXBUJARWMT5R7M35OERXMH3Q22JMMEFLBYNDXXADGFN625HAL4',
        name: 'USDC',
        'name-b64': encoder.encode('VVNEQw=='),
        reserve: '2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM',
        total: 18446744073709552000,
        'unit-name': 'USDC',
        'unit-name-b64': encoder.encode('VVNEQw=='),
        url: 'https://www.centre.io/usdc',
        'url-b64': encoder.encode('aHR0cHM6Ly93d3cuY2VudHJlLmlvL3VzZGM='),
      },
    } satisfies AssetResult)
  },
  ['mainnet-386195940']: () => {
    return new AssetResultBuilder({
      index: 386195940,
      params: {
        creator: 'ETGSQKACKC56JWGMDAEP5S2JVQWRKTQUVKCZTMPNUGZLDVCWPY63LSI3H4',
        decimals: 8,
        'default-frozen': false,
        manager: 'PXLRHMSOTI5LDPRNMMM5F4NDPLCBTHNDLLSZSWFU722PNPMNKBZ2V3ONT4',
        'metadata-hash': encoder.encode('NGI5MjRiOWM0ZTU5NmUxMDU5OWNkZDg5YjkxZDQyMzk='),
        name: 'goETH',
        'name-b64': encoder.encode('Z29FVEg='),
        reserve: 'NLTFR6Y7AAQ6BFFE7NMNJRK3CIZ5U7KSSD6UDMVZ3WOW2TPALOEV57MEEA',
        total: 15000000000000000,
        'unit-name': 'goETH',
        'unit-name-b64': encoder.encode('Z29FVEg='),
        url: 'https://algomint.io',
        'url-b64': encoder.encode('aHR0cHM6Ly9hbGdvbWludC5pbw=='),
      },
    } satisfies AssetResult)
  },
  ['mainnet-408898501']: () => {
    return new AssetResultBuilder({
      index: 408898501,
      params: {
        creator: 'LOOTHTGZ5LIF6M5P6URZMW4BX5UO4IS7KBELOVQDTOJFPS4VGLGD2GA5I4',
        decimals: 1,
        'default-frozen': false,
        manager: 'QZWWSDFQA6PMVEZF6MTNXHKGLT7KOWG62SFU2W4XQOUK7ENDHDZUVRBCYU',
        name: 'Loot Box',
        'name-b64': encoder.encode('TG9vdCBCb3g='),
        reserve: 'LOOTHTGZ5LIF6M5P6URZMW4BX5UO4IS7KBELOVQDTOJFPS4VGLGD2GA5I4',
        total: 100000000,
        'unit-name': 'LTBX',
        'unit-name-b64': encoder.encode('TFRCWA=='),
      },
    } satisfies AssetResult)
  },
  ['mainnet-1707148495']: () => {
    return new AssetResultBuilder({
      index: 1707148495,
      params: {
        creator: 'E4A6FVIHXSZ3F7QXRCOTYDDILVQYEBFH56HYDIIYX4SVXS2QX5GUTBVZHY',
        decimals: 0,
        'default-frozen': false,
        freeze: 'E4A6FVIHXSZ3F7QXRCOTYDDILVQYEBFH56HYDIIYX4SVXS2QX5GUTBVZHY',
        manager: 'E4A6FVIHXSZ3F7QXRCOTYDDILVQYEBFH56HYDIIYX4SVXS2QX5GUTBVZHY',
        name: 'Verification Lofty #29297',
        'name-b64': encoder.encode('VmVyaWZpY2F0aW9uIExvZnR5ICMyOTI5Nw=='),
        reserve: '3XAU3CYHZ3QX4M2DSTEMHPVKKJXSSDMMHADPM6SYRGQDCDQOAAYL3SQY5I',
        total: 1,
        'unit-name': 'VL029297',
        'unit-name-b64': encoder.encode('VkwwMjkyOTc='),
        url: 'template-ipfs://{ipfscid:1:raw:reserve:sha2-256}',
        'url-b64': encoder.encode('dGVtcGxhdGUtaXBmczovL3tpcGZzY2lkOjE6cmF3OnJlc2VydmU6c2hhMi0yNTZ9'),
      },
    } satisfies AssetResult)
  },
  'mainnet-1284444444': () => {
    return new AssetResultBuilder({
      'created-at-round': 34632901,
      deleted: false,
      index: 1284444444,
      params: {
        clawback: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        creator: 'JP3ENKDQC2BOYRMLFGKBS7RB2IVNF7VNHCFHVTRNHOENRQ6R4UN7MCNXPI',
        decimals: 8,
        'default-frozen': false,
        freeze: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        manager: 'JP3ENKDQC2BOYRMLFGKBS7RB2IVNF7VNHCFHVTRNHOENRQ6R4UN7MCNXPI',
        'metadata-hash': encoder.encode('0/1Rvi7owrF6eugm00nA3yD+q4pNaAMDQBx0FWDDJDY='),
        name: 'Orange',
        'name-b64': encoder.encode('T3Jhbmdl'),
        reserve: 'JP3ENKDQC2BOYRMLFGKBS7RB2IVNF7VNHCFHVTRNHOENRQ6R4UN7MCNXPI',
        total: 400000000000000,
        'unit-name': 'ORA',
        'unit-name-b64': encoder.encode('T1JB'),
        url: 'ipfs://QmUitxJuPJJrcuAdAiVdEEpuzGmsELGgAvhLd5FiXRShEu#arc3',
        'url-b64': encoder.encode('aXBmczovL1FtVWl0eEp1UEpKcmN1QWRBaVZkRUVwdXpHbXNFTEdnQXZoTGQ1RmlYUlNoRXUjYXJjMw=='),
      },
    })
  },
  'mainnet-1494117806': () => {
    return new AssetResultBuilder({
      'created-at-round': 36012728,
      deleted: false,
      index: 1494117806,
      params: {
        clawback: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        creator: 'UF5DSSCT3GO62CSTSFB4QN5GNKFIMO7HCF2OIY6D57Z37IETEXRKUUNOPU',
        decimals: 0,
        'default-frozen': false,
        freeze: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        manager: 'UF5DSSCT3GO62CSTSFB4QN5GNKFIMO7HCF2OIY6D57Z37IETEXRKUUNOPU',
        name: 'Zappy #1620',
        'name-b64': encoder.encode('WmFwcHkgIzE2MjA='),
        reserve: 'OPL3M2ZOKLSPVIM32MRK45O6IQMHTJPVWOWPVTEGXVHC3GHFLJK2YC5OWE',
        total: 1,
        'unit-name': 'ZAPP1620',
        'unit-name-b64': encoder.encode('WkFQUDE2MjA='),
        url: 'template-ipfs://{ipfscid:1:raw:reserve:sha2-256}#arc3',
        'url-b64': encoder.encode('dGVtcGxhdGUtaXBmczovL3tpcGZzY2lkOjE6cmF3OnJlc2VydmU6c2hhMi0yNTZ9I2FyYzM='),
      },
    })
  },
  'mainnet-1800979729': () => {
    return new AssetResultBuilder({
      'created-at-round': 38393946,
      deleted: false,
      index: 1800979729,
      params: {
        clawback: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        creator: 'EHYQCYHUC6CIWZLBX5TDTLVJ4SSVE4RRTMKFDCG4Z4Q7QSQ2XWIQPMKBPU',
        decimals: 0,
        'default-frozen': false,
        freeze: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        manager: 'EHYQCYHUC6CIWZLBX5TDTLVJ4SSVE4RRTMKFDCG4Z4Q7QSQ2XWIQPMKBPU',
        name: 'DHMα: M1 Solar Flare SCQCSO',
        'name-b64': encoder.encode('REhNzrE6IE0xIFNvbGFyIEZsYXJlIFNDUUNTTw=='),
        reserve: 'ESK3ZHVALWTRWTEQVRO4ZGZGGOFCKCJNVE5ODFMPWICXVSJVJZYINHHYHE',
        total: 1,
        'unit-name': 'SOLFLARE',
        'unit-name-b64': encoder.encode('U09MRkxBUkU='),
        url: 'https://assets.datahistory.org/solar/SCQCSO.mp4#v',
        'url-b64': encoder.encode('aHR0cHM6Ly9hc3NldHMuZGF0YWhpc3Rvcnkub3JnL3NvbGFyL1NDUUNTTy5tcDQjdg=='),
      },
    })
  },
  'mainnet-854081201': () => {
    return new AssetResultBuilder({
      'created-at-round': 23110800,
      deleted: false,
      index: 854081201,
      params: {
        clawback: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        creator: 'JUT54SRAQLZ34MZ7I45KZJG63H3VLJ65VLLOLVVXPIBE3B2C7GFKBF5QAE',
        decimals: 0,
        'default-frozen': false,
        freeze: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        manager: 'JUT54SRAQLZ34MZ7I45KZJG63H3VLJ65VLLOLVVXPIBE3B2C7GFKBF5QAE',
        name: 'Bad Bunny Society #587',
        'name-b64': encoder.encode('QmFkIEJ1bm55IFNvY2lldHkgIzU4Nw=='),
        reserve: 'V4UCC2YXBHLELD7Y6HYSKZI4GABLUG5HE6HAQQ36OBXFEZS7W4VMWB6DUQ',
        total: 1,
        'unit-name': 'bbs587',
        'unit-name-b64': encoder.encode('YmJzNTg3'),
        url: 'template-ipfs://{ipfscid:1:raw:reserve:sha2-256}',
        'url-b64': encoder.encode('dGVtcGxhdGUtaXBmczovL3tpcGZzY2lkOjE6cmF3OnJlc2VydmU6c2hhMi0yNTZ9'),
      },
    })
  },
  'mainnet-917559': () => {
    return new AssetResultBuilder({
      'created-at-round': 6354271,
      deleted: true,
      'destroyed-at-round': 6354625,
      index: 917559,
      params: {
        clawback: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        creator: 'YA2XBMS34J27VKLIWJQ5AWU7FJASZ6PUNICQOB4PJ2NW4CAX5AHB7RVGMY',
        decimals: 0,
        'default-frozen': false,
        freeze: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        manager: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        reserve: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        total: 0,
      },
    })
  },
  'mainnet-1820067164': () => {
    return new AssetResultBuilder({
      index: 1820067164,
      params: {
        creator: 'COOPLFOESCTQJVLSFKAA4QURNBDZGMRYJVRH7BRRREB7FFZSHIIA4AVIBE',
        decimals: 0,
        'default-frozen': false,
        manager: 'COOPLFOESCTQJVLSFKAA4QURNBDZGMRYJVRH7BRRREB7FFZSHIIA4AVIBE',
        name: 'Coop #48',
        'name-b64': encoder.encode('Q29vcCAjNDg='),
        reserve: '6ZTNQ3SPQEYOWIXZHQR6HSX6CZSQ4FLYOXOCPNJSNRRT6QA2FFD6JIBDSI',
        total: 1,
        'unit-name': 'Coop48',
        'unit-name-b64': encoder.encode('Q29vcDQ4'),
        url: 'template-ipfs://{ipfscid:1:raw:reserve:sha2-256}',
        'url-b64': encoder.encode('dGVtcGxhdGUtaXBmczovL3tpcGZzY2lkOjE6cmF3OnJlc2VydmU6c2hhMi0yNTZ9'),
      },
    })
  },
}
