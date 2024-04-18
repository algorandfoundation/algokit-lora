import { AssetResult, TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { TransactionResultBuilder, transactionResultBuilder } from '../builders/transaction-result-builder'
import { TransactionType } from 'algosdk'

export const transactionResultMother = {
  payment: () => {
    return transactionResultBuilder().paymentTransaction()
  },
  transfer: (asset: AssetResult) => {
    return transactionResultBuilder().transferTransaction(asset)
  },
  multisig: () => {
    return transactionResultBuilder()
      .paymentTransaction()
      .withSignature({
        multisig: {
          subsignature: [
            {
              'public-key': 'hYkIN+Iyt2675q+XuYwoAzwR8B0P17WTUFGYn456E4o=',
              signature: 'eBLuSsmbqXTtKcoDpI88t7CNyQ7ggJ8ZMGjpy+hLWnvjNi938/5U6Eb25Dmes0WLkCxnDZG7gsj3YIDmZfFLAA==',
            },
            {
              'public-key': '5ChQFEXiHWTeXoJCRymNn8rmEAJAxpaigu4wIgcaODU=',
              signature: '45ndEdxV115jUGBmqt4WSjcBDg847CiPlE0w5omziLftSRzOtJSd5zrF1zkHOa1B1GJV4AE8E2qriMIbifnYBw==',
            },
            {
              'public-key': 'RjQ91+zvYumrPm9UOEMN+GnlHW+0gliRCCV2b6KOlwk=',
              signature: 'LbmMSdKaqD/s9M1ldNAvLYGRMwxWdVPbl4i2zBVKwRnrRLM1Ape9zWMAxX1yJGxk/mAKGa9lZwAfQUlyus58Cw==',
            },
          ],
          threshold: 3,
          version: 1,
        },
      })
  },
  logicsig: () => {
    return transactionResultBuilder()
      .paymentTransaction()
      .withSignature({
        logicsig: { logic: 'CIEBQw==' },
      })
  },
  ['mainnet-FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ']: () => {
    return new TransactionResultBuilder({
      id: 'FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ',
      'close-rewards': 0,
      'closing-amount': 0,
      'confirmed-round': 36570178,
      fee: 1000,
      'first-valid': 36570176,
      'genesis-hash': 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
      'genesis-id': 'mainnet-v1.0',
      'intra-round-offset': 86,
      'last-valid': 36571176,
      note: 'MTM0MDI4MzIxNDIxMjQ3NzQ6NjM5NDYxOTE2MDI4MzUwNzcxMg==',
      'payment-transaction': {
        amount: 236070000,
        'close-amount': 0,
        receiver: 'KIZLH4HUM5ZIB5RVP6DR2IGXB44TGJ6HZUZIAYZFZ63KWCAQB2EZGPU5BQ',
      },
      'receiver-rewards': 0,
      'round-time': 1709189521,
      sender: 'M3IAMWFYEIJWLWFIIOEDFOLGIVMEOB3F4I3CA4BIAHJENHUUSX63APOXXM',
      'sender-rewards': 0,
      signature: {
        sig: '4cwwpWiOnldnkW+M8Epwg2iaJvxdIvnUa9jM+uZxRcBTESRCD/BcsvbPVYrqEf6YwGCtsupNbNo6SwdUQRa2CQ==',
      },
      'tx-type': TransactionType.pay,
    } satisfies TransactionResult)
  },
  ['mainnet-ILDCD5Z64CYSLEZIHBG5DVME2ITJI2DIVZAPDPEWPCYMTRA5SVGA']: () => {
    // Payment transaction:
    //   - Same sender and receiver
    return new TransactionResultBuilder({
      id: 'ILDCD5Z64CYSLEZIHBG5DVME2ITJI2DIVZAPDPEWPCYMTRA5SVGA',
      'close-rewards': 0,
      'closing-amount': 0,
      'confirmed-round': 34675056,
      fee: 0,
      'first-valid': 34675052,
      'genesis-hash': 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
      'genesis-id': 'mainnet-v1.0',
      group: '5HGmi2n3M2zk/mzPEFkLnNomDu/jvwHs1k+bCZzIbNs=',
      'intra-round-offset': 26,
      'last-valid': 34676052,
      note: 'aXBmczovL2JhZnliZWlhZGg2bGVia3A0d3l6dHZnNDRhdHp4aXg0NmduNWZ6bnJnN2tlNGEyd200NXNpazJ6d3Zt',
      'payment-transaction': {
        amount: 0,
        'close-amount': 0,
        receiver: 'TDV4LF2HO7NWHQPDQWTQWXWXKZ4W6N7UA2N6GJ6PKP6WSP6J2YIPUCQNHM',
      },
      'receiver-rewards': 0,
      'round-time': 1703439471,
      sender: 'TDV4LF2HO7NWHQPDQWTQWXWXKZ4W6N7UA2N6GJ6PKP6WSP6J2YIPUCQNHM',
      'sender-rewards': 0,
      signature: {
        logicsig: {
          args: [],
          logic:
            'BiACAQAyBIECEjMAECISEDMBECISEEAAAQAzABAiEjMAAIAgmuynOZoqgz+a/xcbx+bwgMhYYxATBclcyl1ZYTKM4XQSEDMABzMBABIQMwAgMgMSEDMACTIDEhAzARAiEjMBCCMSEDMBADMBBxIQMwEFVwAHgAdpcGZzOi8vEhAzAQEjEhAzASAyAxIQMwEJMgMSEBBD',
        },
      },
      'tx-type': TransactionType.pay,
    } satisfies TransactionResult)
  },
  ['mainnet-JBDSQEI37W5KWPQICT2IGCG2FWMUGJEUYYK3KFKNSYRNAXU2ARUA']: () => {
    // Asset transfer transaction
    return new TransactionResultBuilder({
      'asset-transfer-transaction': {
        amount: 300000,
        'asset-id': 523683256,
        'close-amount': 0,
        receiver: 'OCD5PQECXPYOVTLWVS3FHIODQX5FOV4QNNVMU22BSVDMP2FAJD52OV4IFA',
      },
      'auth-addr': 'P5F3CASEUYS5MBY56CZCKZM4EMJRG5MTYXIGVK6EHEB6FXRYMLE5VCTSUU',
      'close-rewards': 0,
      'closing-amount': 0,
      'confirmed-round': 37351572,
      fee: 1000,
      'first-valid': 37351570,
      'genesis-hash': 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
      'genesis-id': 'mainnet-v1.0',
      id: 'JBDSQEI37W5KWPQICT2IGCG2FWMUGJEUYYK3KFKNSYRNAXU2ARUA',
      'intra-round-offset': 114,
      'last-valid': 37352570,
      note: 'AEYAcgBhAGMAYwB0AGEAbAAgAEEAbABlAHIAdAA6ACAAQQBjAHQAaQB2AGUAIABQAGwAYQB5AGUAcgAgAFIAZQB3AGEAcgBkAC4AIABUAGgAYQBuAGsAcwAgAGYAbwByACAAcABsAGEAeQBpAG4AZwAh',
      'receiver-rewards': 0,
      'round-time': 1711438129,
      sender: '6MO6VE4DBZ2ZKNHHY747LABB5QGSH6V6IQ4EZZW2HXDFXHHQVKRIVRHSJM',
      'sender-rewards': 0,
      signature: {
        sig: 'hk4FtHwulzfGDFq13MFsJfVS4UVdQAGhqFvsp9CjF9F6dD3V/P0XtW4V3cv2l8u0M1TDQoUsNbueW+SaQbD7DA==',
      },
      'tx-type': TransactionType.axfer,
    } satisfies TransactionResult)
  },
  ['mainnet-V7GQPE5TDMB4BIW2GCTPCBMXYMCF3HQGLYOYHGWP256GQHN5QAXQ']: () => {
    // Asset transfer transaction with close remainder. It is an asset opt-out transaction.
    return new TransactionResultBuilder({
      'asset-transfer-transaction': {
        amount: 0,
        'asset-id': 140479105,
        'close-amount': 0,
        'close-to': 'LINTQTVHWUFZR677Z6GD3MTVWEXDX26Z2V7Q7QSD6NOQ6WOZTMSIMYCQE4',
        receiver: 'LINTQTVHWUFZR677Z6GD3MTVWEXDX26Z2V7Q7QSD6NOQ6WOZTMSIMYCQE4',
      },
      'close-rewards': 0,
      'closing-amount': 0,
      'confirmed-round': 30666726,
      fee: 1000,
      'first-valid': 30666724,
      'genesis-hash': 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
      id: 'V7GQPE5TDMB4BIW2GCTPCBMXYMCF3HQGLYOYHGWP256GQHN5QAXQ',
      'intra-round-offset': 18,
      'last-valid': 30667724,
      'receiver-rewards': 0,
      'round-time': 1689880083,
      sender: 'J2WKA2P622UGRYLEQJPTM3K62RLWOKWSIY32A7HUNJ7HKQCRJANHNBFLBQ',
      'sender-rewards': 0,
      signature: {
        sig: 'fK9vks0Sk2Sfa0PN+9wHSYYh2OKCFxSGBN2B4agVmVNoui17XcwXj4DbLJZWoknbVH/0gaKweKEYMIz4Oe8tDw==',
      },
      'tx-type': TransactionType.axfer,
    } satisfies TransactionResult)
  },
  ['mainnet-563MNGEL2OF4IBA7CFLIJNMBETT5QNKZURSLIONJBTJFALGYOAUA']: () => {
    // Asset opt-in
    return new TransactionResultBuilder({
      'asset-transfer-transaction': {
        amount: 0,
        'asset-id': 312769,
        'close-amount': 0,
        receiver: 'SMO6HD4QPUGP2PI5HVE6SXQPBXGXOHB6HFKXY4RMUWM56S7BVDK2U7ALKU',
      },
      'close-rewards': 0,
      'closing-amount': 0,
      'confirmed-round': 6325026,
      fee: 1000,
      'first-valid': 6324488,
      'genesis-hash': 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
      'genesis-id': 'mainnet-v1.0',
      id: '563MNGEL2OF4IBA7CFLIJNMBETT5QNKZURSLIONJBTJFALGYOAUA',
      'intra-round-offset': 0,
      'last-valid': 6325488,
      note: 'MTU4ODAxMjcyNjU5OTgzNDM2OA==',
      'receiver-rewards': 0,
      'round-time': 1588015047,
      sender: 'SMO6HD4QPUGP2PI5HVE6SXQPBXGXOHB6HFKXY4RMUWM56S7BVDK2U7ALKU',
      'sender-rewards': 0,
      signature: { sig: 'eXs6In2s6DdoRIBHLesRRS9BX+UWykWX4YGPuTdOLJTn33NXM5paD7kZiB+4FQ27a+F7W2QEWJYU8QEzDHTVAQ==' },
      'tx-type': TransactionType.axfer,
    } satisfies TransactionResult)
  },

  ['testnet-VIXTUMAPT7NR4RB2WVOGMETW4QY43KIDA3HWDWWXS3UEDKGTEECQ']: () => {
    // Asset clawback
    return new TransactionResultBuilder({
      'asset-transfer-transaction': {
        amount: 5,
        'asset-id': 642327435,
        'close-amount': 0,
        receiver: 'ATSGPNTPGMJ2U3GQRSEXA2OZGFPMKPO66NNPIKFD4LHETHYIYRIRIN6GJE',
        sender: 'AT3QNHSO7VZ2CPEZGI4BG7M3TIUG7YE5KZXNAE55Z4QHHAGBEU6K2LCJUA',
      },
      'close-rewards': 0,
      'closing-amount': 0,
      'confirmed-round': 39050091,
      fee: 1000,
      'first-valid': 39050089,
      'genesis-hash': 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
      'genesis-id': 'testnet-v1.0',
      id: 'VIXTUMAPT7NR4RB2WVOGMETW4QY43KIDA3HWDWWXS3UEDKGTEECQ',
      'intra-round-offset': 9,
      'last-valid': 39051089,
      note: 'VHJhbnNmZXIgNSBhc3NldHMgd2l0IGlkICQ2NDIzMjc0MzU=',
      'receiver-rewards': 0,
      'round-time': 1713177404,
      sender: 'ATJJRFAQVMD3YVX47HZLK2GRNKZLS3YDRLJ62JJPLUCZPDJE7QPQZDTVGY',
      'sender-rewards': 0,
      signature: { sig: 'LYTng1fmA+JQ8AocqDfp/OBvrds/WXa936muT3b4Ym98qIzouEnbMf7cOj099GV+ABecBzmw6+JrzOH/WU7TDQ==' },
      'tx-type': TransactionType.axfer,
    } satisfies TransactionResult)
  },
}
