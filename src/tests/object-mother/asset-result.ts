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
        total: 18446744073709552000n,
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
        total: 10000000000000000n,
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
        total: 18446744073709552000n,
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
        total: 15000000000000000n,
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
  'mainnet-924268058': () => {
    return new AssetResultBuilder({
      index: 924268058,
      params: {
        creator: 'V6SGZIWO6OAKUTKERDUFACQBPXMGPCNGEYMUANHRZA475YONW5B4BBLVL4',
        decimals: 6,
        'default-frozen': false,
        manager: 'ATPVJYGEGP5H6GCZ4T6CG4PK7LH5OMWXHLXZHDPGO7RO6T3EHWTF6UUY6E',
        name: 'FrysCrypto',
        'name-b64': encoder.encode('RnJ5c0NyeXB0bw=='),
        reserve: 'ATPVJYGEGP5H6GCZ4T6CG4PK7LH5OMWXHLXZHDPGO7RO6T3EHWTF6UUY6E',
        total: 8000000000000000,
        'unit-name': 'FRY',
        'unit-name-b64': encoder.encode('RlJZ'),
        url: 'https://fryscryptoexcursions.com',
        'url-b64': encoder.encode('aHR0cHM6Ly9mcnlzY3J5cHRvZXhjdXJzaW9ucy5jb20='),
      },
    })
  },
  'mainnet-1010208883': () => {
    return new AssetResultBuilder({
      index: 1010208883,
      params: {
        creator: 'XSKED5VKZZCSYNDWXZJI65JM2HP7HZFJWCOBIMOONKHTK5UVKENBNVDEYM',
        decimals: 6,
        'default-frozen': false,
        'metadata-hash': encoder.encode('AAAAADcXNhoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='),
        name: 'TinymanPool2.0 FRY-ALGO',
        'name-b64': encoder.encode('VGlueW1hblBvb2wyLjAgRlJZLUFMR08='),
        reserve: 'YLNMUHDGH2G7G2PQMSU7K4TEQ6JPNE752LLXECCA7XCE3AB7JO3I3HQTDQ',
        total: 18446744073709551615n,
        'unit-name': 'TMPOOL2',
        'unit-name-b64': encoder.encode('VE1QT09MMg=='),
        url: 'https://tinyman.org',
        'url-b64': encoder.encode('aHR0cHM6Ly90aW55bWFuLm9yZw=='),
      },
    })
  },
  'mainnet-1096015467': () => {
    return new AssetResultBuilder({
      index: 1096015467,
      params: {
        creator: 'B34VMB7AAF2JZHLUZL4ROAFAV7Q5TY2JXFCDGAJFYHNQAMVE5BCGGVEGAE',
        decimals: 4,
        'default-frozen': false,
        manager: 'B34VMB7AAF2JZHLUZL4ROAFAV7Q5TY2JXFCDGAJFYHNQAMVE5BCGGVEGAE',
        'metadata-hash': encoder.encode('MWQ3NWYwNGYwZmE5NDA3MDkxOWZkZDNlY2FhMmM1ZmQ='),
        name: 'Pepe',
        'name-b64': encoder.encode('UGVwZQ=='),
        total: 4206899999999990000n,
        'unit-name': 'PEPE',
        'unit-name-b64': encoder.encode('UEVQRQ=='),
      },
    })
  },
  'mainnet-1162292622': () => {
    return new AssetResultBuilder({
      index: 1162292622,
      params: {
        clawback: 'X2GAK5VORHXKCO54XYSP3AMP2MRFLGJTLDTZ66OA5XH4UEXIMPWHFWTQTA',
        creator: 'X2GAK5VORHXKCO54XYSP3AMP2MRFLGJTLDTZ66OA5XH4UEXIMPWHFWTQTA',
        decimals: 0,
        'default-frozen': true,
        manager: 'X2GAK5VORHXKCO54XYSP3AMP2MRFLGJTLDTZ66OA5XH4UEXIMPWHFWTQTA',
        name: 'orange.algo',
        'name-b64': encoder.encode('b3JhbmdlLmFsZ28='),
        reserve: 'D5SUIQBFNJTDKF6SQLSQHOBFIO72C3NT3B24LLA6IQFB6CY2AQZU3Z7A2M',
        total: 1,
        'unit-name': 'NFD',
        'unit-name-b64': encoder.encode('TkZE'),
        url: 'template-ipfs://{ipfscid:1:dag-pb:reserve:sha2-256}/nfd.json',
        'url-b64': encoder.encode('dGVtcGxhdGUtaXBmczovL3tpcGZzY2lkOjE6ZGFnLXBiOnJlc2VydmU6c2hhMi0yNTZ9L25mZC5qc29u'),
      },
    })
  },
  'mainnet-1294765516': () => {
    return new AssetResultBuilder({
      index: 1294765516,
      params: {
        creator: 'XSKED5VKZZCSYNDWXZJI65JM2HP7HZFJWCOBIMOONKHTK5UVKENBNVDEYM',
        decimals: 6,
        'default-frozen': false,
        'metadata-hash': encoder.encode('AAAAAEyPERwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='),
        name: 'TinymanPool2.0 ORA-ALGO',
        'name-b64': encoder.encode('VGlueW1hblBvb2wyLjAgT1JBLUFMR08='),
        reserve: 'TRCEY5UZGTATGTF5K3U42IMDT467D4EHV7S5MYJBMLMYARYJOZFATORMUM',
        total: 18446744073709551615n,
        'unit-name': 'TMPOOL2',
        'unit-name-b64': encoder.encode('VE1QT09MMg=='),
        url: 'https://tinyman.org',
        'url-b64': encoder.encode('aHR0cHM6Ly90aW55bWFuLm9yZw=='),
      },
    })
  },
  'mainnet-1355858325': () => {
    return new AssetResultBuilder({
      index: 1355858325,
      params: {
        clawback: 'JTVFQXCOHCRFZ6FE3WRNAKXTV32OWIJLG6XVVQPYNWGTWO3R3PIQEFVXEU',
        creator: 'JTVFQXCOHCRFZ6FE3WRNAKXTV32OWIJLG6XVVQPYNWGTWO3R3PIQEFVXEU',
        decimals: 0,
        'default-frozen': true,
        manager: 'JTVFQXCOHCRFZ6FE3WRNAKXTV32OWIJLG6XVVQPYNWGTWO3R3PIQEFVXEU',
        name: 'ora.algo',
        'name-b64': encoder.encode('b3JhLmFsZ28='),
        reserve: 'QFHY7RDHAEEEG6JUPJWNSELKAUDEUCL6QQNVB3JZFSEFSQG75DYVODMPMU',
        total: 1,
        'unit-name': 'NFD',
        'unit-name-b64': encoder.encode('TkZE'),
        url: 'template-ipfs://{ipfscid:1:dag-pb:reserve:sha2-256}/nfd.json',
        'url-b64': encoder.encode('dGVtcGxhdGUtaXBmczovL3tpcGZzY2lkOjE6ZGFnLXBiOnJlc2VydmU6c2hhMi0yNTZ9L25mZC5qc29u'),
      },
    })
  },
  'mainnet-1355898842': () => {
    return new AssetResultBuilder({
      index: 1355898842,
      params: {
        clawback: 'OOHFIBQPTGCV7XVSFC7A73ZW5GQRWX2Q2HM5SISPMTA3FN6S7N7ZPEJZLI',
        creator: 'OOHFIBQPTGCV7XVSFC7A73ZW5GQRWX2Q2HM5SISPMTA3FN6S7N7ZPEJZLI',
        decimals: 0,
        'default-frozen': true,
        manager: 'OOHFIBQPTGCV7XVSFC7A73ZW5GQRWX2Q2HM5SISPMTA3FN6S7N7ZPEJZLI',
        name: 'rita.ora.algo',
        'name-b64': encoder.encode('cml0YS5vcmEuYWxnbw=='),
        reserve: 'NOR6VRUCOVUMD2FSP2XGUHXCEROOC7OHW6C4WK2NHVQMZN6LUWBZ4ERVJI',
        total: 1,
        'unit-name': 'NFD',
        'unit-name-b64': encoder.encode('TkZE'),
        url: 'template-ipfs://{ipfscid:1:dag-pb:reserve:sha2-256}/nfd.json',
        'url-b64': encoder.encode('dGVtcGxhdGUtaXBmczovL3tpcGZzY2lkOjE6ZGFnLXBiOnJlc2VydmU6c2hhMi0yNTZ9L25mZC5qc29u'),
      },
    })
  },
  'mainnet-1024439078': () => {
    return new AssetResultBuilder({
      index: 1024439078,
      params: {
        clawback: 'KPVZ66IFE7KHQ6623XHTPVS3IL7BXBE3HXQG35J65CVDA54VLRPP4SVOU4',
        creator: 'KPVZ66IFE7KHQ6623XHTPVS3IL7BXBE3HXQG35J65CVDA54VLRPP4SVOU4',
        decimals: 0,
        'default-frozen': false,
        freeze: 'KPVZ66IFE7KHQ6623XHTPVS3IL7BXBE3HXQG35J65CVDA54VLRPP4SVOU4',
        manager: 'KPVZ66IFE7KHQ6623XHTPVS3IL7BXBE3HXQG35J65CVDA54VLRPP4SVOU4',
        name: 'Fracctal Token',
        'name-b64': encoder.encode('RnJhY2N0YWwgVG9rZW4='),
        reserve: 'YQTVEPKB4O5F26H76L5I7BA6VGCMRC6P2QSWRKG4KVJLJ62MVYTDJPM6KE',
        total: 10000000000,
        'unit-name': 'FRACC',
        'unit-name-b64': encoder.encode('RlJBQ0M='),
        url: 'template-ipfs://{ipfscid:0:dag-pb:reserve:sha2-256}',
        'url-b64': encoder.encode('dGVtcGxhdGUtaXBmczovL3tpcGZzY2lkOjA6ZGFnLXBiOnJlc2VydmU6c2hhMi0yNTZ9'),
      },
    })
  },
  'mainnet-850924184': () => {
    return new AssetResultBuilder({
      index: 850924184,
      params: {
        creator: 'MDIVKI64M2HEKCWKH7SOTUXEEW6KNOYSAOBTDTS32KUQOGUT75D43MSP5M',
        decimals: 0,
        'default-frozen': false,
        manager: 'MDIVKI64M2HEKCWKH7SOTUXEEW6KNOYSAOBTDTS32KUQOGUT75D43MSP5M',
        name: 'Forest',
        'name-b64': encoder.encode('Rm9yZXN0'),
        reserve: 'MDIVKI64M2HEKCWKH7SOTUXEEW6KNOYSAOBTDTS32KUQOGUT75D43MSP5M',
        total: 1,
        'unit-name': 'GEMS NFT',
        'unit-name-b64': encoder.encode('R0VNUyBORlQ='),
        url: 'ipfs://QmWJo2KjMnsjpnNusxLPSzyVMMiYPPVTSTGSHJQhJGUavr',
        'url-b64': encoder.encode('aXBmczovL1FtV0pvMktqTW5zanBuTnVzeExQU3p5Vk1NaVlQUFZUU1RHU0hKUWhKR1VhdnI='),
      },
    })
  },
  'mainnet-847594689': () => {
    return new AssetResultBuilder({
      index: 847594689,
      params: {
        creator: 'PZNGYF4Y25GGO674BW4CRDHFKOKHMHZXSFXIKMYPEJCQAUTDH52WV24XTY',
        decimals: 0,
        'default-frozen': false,
        manager: 'PZNGYF4Y25GGO674BW4CRDHFKOKHMHZXSFXIKMYPEJCQAUTDH52WV24XTY',
        name: 'Headline(Rare)',
        'name-b64': encoder.encode('SGVhZGxpbmUoUmFyZSk='),
        reserve: 'PZNGYF4Y25GGO674BW4CRDHFKOKHMHZXSFXIKMYPEJCQAUTDH52WV24XTY',
        total: 250,
        'unit-name': 'HEAD-1',
        'unit-name-b64': encoder.encode('SEVBRC0x'),
        url: 'https://algoleagues.mypinata.cloud/ipfs/QmZMLEVGvBqHWMGb3MbkfCKR7G5bnLMRUZnquJE1FsEucZ',
        'url-b64': encoder.encode(
          'aHR0cHM6Ly9hbGdvbGVhZ3Vlcy5teXBpbmF0YS5jbG91ZC9pcGZzL1FtWk1MRVZHdkJxSFdNR2IzTWJrZkNLUjdHNWJuTE1SVVpucXVKRTFGc0V1Y1o='
        ),
      },
    })
  },
  'mainnet-880903652': () => {
    return new AssetResultBuilder({
      index: 880903652,
      params: {
        clawback: 'EP3I5HF6N3B7NSLVJ5YOZNTW3B4L46RUTELW6GIWZZ6ZCV5XOVT5PTOHAI',
        creator: 'X6MNR4AVJQEMJRHAPZ6F4O4SVDIYN67ZRMD2O3ULPY4QFMANQNZOEYHODE',
        decimals: 0,
        'default-frozen': true,
        freeze: 'EMWPXNULSR3US737FFOSEJJB4B3R5BJQRYCVYPJSP7IUBRXUN3LF4MG2NA',
        manager: 'EMWPXNULSR3US737FFOSEJJB4B3R5BJQRYCVYPJSP7IUBRXUN3LF4MG2NA',
        'metadata-hash': encoder.encode('GXcG0xwqXopAsImnHMHXwZCWETndsst2oWvmEOa2Vg4='),
        name: 'D01-04 #6588',
        'name-b64': encoder.encode('RDAxLTA0ICM2NTg4'),
        reserve: 'EMWPXNULSR3US737FFOSEJJB4B3R5BJQRYCVYPJSP7IUBRXUN3LF4MG2NA',
        total: 1,
        'unit-name': 'D01-04',
        'unit-name-b64': encoder.encode('RDAxLTA0'),
        url: 'ipfs://QmPsu35dDEbyQeNiTRPvTLgxbsjMSQB3GAQopi9Li15Qo2#arc3',
        'url-b64': encoder.encode('aXBmczovL1FtUHN1MzVkREVieVFlTmlUUlB2VExneGJzak1TUUIzR0FRb3BpOUxpMTVRbzIjYXJjMw==)'),
      },
    })
  },
  'testnet-210971834': () => {
    return new AssetResultBuilder({
      index: 210971834,
      params: {
        clawback: 'LTBSRXEMYSIPDDKNSJUHMKJQSK3JJHZVGSSPXHDYBC5GTOU6V7HQTM7RHI',
        creator: 'LTBSRXEMYSIPDDKNSJUHMKJQSK3JJHZVGSSPXHDYBC5GTOU6V7HQTM7RHI',
        decimals: 6,
        'default-frozen': false,
        freeze: 'LTBSRXEMYSIPDDKNSJUHMKJQSK3JJHZVGSSPXHDYBC5GTOU6V7HQTM7RHI',
        manager: 'LTBSRXEMYSIPDDKNSJUHMKJQSK3JJHZVGSSPXHDYBC5GTOU6V7HQTM7RHI',
        name: 'CT-TEF - Laza-Touza',
        'name-b64': encoder.encode('Q1QtVEVGIC0gTGF6YS1Ub3V6YQ=='),
        reserve: 'LTBSRXEMYSIPDDKNSJUHMKJQSK3JJHZVGSSPXHDYBC5GTOU6V7HQTM7RHI',
        total: 9223372036854776000,
        'unit-name': 'CO2P',
        'unit-name-b64': encoder.encode('Q08yUA=='),
        url: 'https://www.climatetrade.com',
        'url-b64': encoder.encode('aHR0cHM6Ly93d3cuY2xpbWF0ZXRyYWRlLmNvbQ=='),
      },
    })
  },
  'mainnet-909935715': () => {
    return new AssetResultBuilder({
      index: 909935715,
      params: {
        creator: 'CB3KEWUQUTDHQ3TC4P65UQLHC3S7KNBWPTHOFAL7CV4QCDUPDNVY5J3BT4',
        decimals: 0,
        'default-frozen': false,
        manager: 'CB3KEWUQUTDHQ3TC4P65UQLHC3S7KNBWPTHOFAL7CV4QCDUPDNVY5J3BT4',
        'metadata-hash': encoder.encode('oI4v6jtZzOWqm+GCfJaLS/FU8QjgR+1EawzZMvonXA0='),
        name: 'NK 0217',
        'name-b64': encoder.encode('TksgMDIxNw=='),
        total: 1,
        'unit-name': 'NK 0217',
        'unit-name-b64': encoder.encode('TksgMDIxNw=='),
        url: 'ipfs://QmfYFvNon3vfxbwtcetjYc1uZZ1Faw7AsQtSzz45sxXnaj#arc3',
        'url-b64': encoder.encode('aXBmczovL1FtZllGdk5vbjN2Znhid3RjZXRqWWMxdVpaMUZhdzdBc1F0U3p6NDVzeFhuYWojYXJjMw=='),
      },
    })
  },
  'testnet-705735468': () => {
    return new AssetResultBuilder({
      index: 705735468,
      params: {
        clawback: 'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
        creator: 'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
        decimals: 0,
        'default-frozen': false,
        manager: 'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
        name: 'Test',
        'name-b64': encoder.encode('VGVzdA=='),
        total: 1,
        'unit-name': 'test',
        'unit-name-b64': encoder.encode('dGVzdA=='),
      },
    })
  },
  'testnet-705736233': () => {
    return new AssetResultBuilder({
      index: 705736233,
      params: {
        clawback: 'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
        creator: 'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
        decimals: 0,
        'default-frozen': false,
        manager: 'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
        name: 'Test',
        'name-b64': encoder.encode('VGVzdA=='),
        total: 1,
        'unit-name': 'test',
        'unit-name-b64': encoder.encode('dGVzdA=='),
      },
    })
  },
  'testnet-705736805': () => {
    return new AssetResultBuilder({
      index: 705736805,
      params: {
        clawback: 'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
        creator: 'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
        decimals: 0,
        'default-frozen': false,
        manager: 'GYLUGN4H7Z45AW2BHYFLWS2YUMTK2MI6YANBFPW3SCHYXFRCACYXJDPSPI',
        name: 'Test',
        'name-b64': encoder.encode('VGVzdA=='),
        total: 1,
        'unit-name': 'test',
        'unit-name-b64': encoder.encode('dGVzdA=='),
      },
    })
  },
  'testnet-705457144': () => {
    return new AssetResultBuilder({
      index: 705457144,
      params: {
        clawback: '25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE',
        creator: '25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE',
        decimals: 0,
        'default-frozen': false,
        freeze: '25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE',
        manager: '25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE',
        name: 'gold nugget',
        'name-b64': encoder.encode('Z29sZCBudWdnZXQ='),
        reserve: '25M5BT2DMMED3V6CWDEYKSNEFGPXX4QBIINCOICLXXRU3UGTSGRMF3MTOE',
        total: 1,
        'unit-name': 'piece',
        'unit-name-b64': encoder.encode('cGllY2U='),
        url: 'https://path/to/my/asset/details',
        'url-b64': encoder.encode('aHR0cHM6Ly9wYXRoL3RvL215L2Fzc2V0L2RldGFpbHM='),
      },
    })
  },
}
