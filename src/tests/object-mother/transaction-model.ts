import { TransactionResult } from '@algorandfoundation/algokit-utils/types/indexer'
import { transactionResultBuilder } from '../builders/transaction-result-builder'

export const transactionModelMother = {
  payment: () => {
    return transactionResultBuilder().paymentTransaction()
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
  mainnet: () => {
    return {
      FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ: () => {
        return JSON.parse(
          `{
            "id": "FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ",
            "close-rewards": 0,
            "closing-amount": 0,
            "confirmed-round": 36570178,
            "fee": 1000,
            "first-valid": 36570176,
            "genesis-hash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
            "genesis-id": "mainnet-v1.0",
            "intra-round-offset": 86,
            "last-valid": 36571176,
            "note": "MTM0MDI4MzIxNDIxMjQ3NzQ6NjM5NDYxOTE2MDI4MzUwNzcxMg==",
            "payment-transaction": {
              "amount": 236070000,
              "close-amount": 0,
              "receiver": "KIZLH4HUM5ZIB5RVP6DR2IGXB44TGJ6HZUZIAYZFZ63KWCAQB2EZGPU5BQ"
            },
            "receiver-rewards": 0,
            "round-time": 1709189521,
            "sender": "M3IAMWFYEIJWLWFIIOEDFOLGIVMEOB3F4I3CA4BIAHJENHUUSX63APOXXM",
            "sender-rewards": 0,
            "signature": {
              "sig": "4cwwpWiOnldnkW+M8Epwg2iaJvxdIvnUa9jM+uZxRcBTESRCD/BcsvbPVYrqEf6YwGCtsupNbNo6SwdUQRa2CQ=="
            },
            "tx-type": "pay"
          }`
        ) satisfies TransactionResult
      },
      ILDCD5Z64CYSLEZIHBG5DVME2ITJI2DIVZAPDPEWPCYMTRA5SVGA: () => {
        // Payment transaction:
        //   - Same sender and receiver
        return JSON.parse(
          `{
            "id": "ILDCD5Z64CYSLEZIHBG5DVME2ITJI2DIVZAPDPEWPCYMTRA5SVGA",
            "close-rewards": 0,
            "closing-amount": 0,
            "confirmed-round": 34675056,
            "fee": 0,
            "first-valid": 34675052,
            "genesis-hash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
            "genesis-id": "mainnet-v1.0",
            "group": "5HGmi2n3M2zk/mzPEFkLnNomDu/jvwHs1k+bCZzIbNs=",
            "intra-round-offset": 26,
            "last-valid": 34676052,
            "note": "aXBmczovL2JhZnliZWlhZGg2bGVia3A0d3l6dHZnNDRhdHp4aXg0NmduNWZ6bnJnN2tlNGEyd200NXNpazJ6d3Zt",
            "payment-transaction": {
              "amount": 0,
              "close-amount": 0,
              "receiver": "TDV4LF2HO7NWHQPDQWTQWXWXKZ4W6N7UA2N6GJ6PKP6WSP6J2YIPUCQNHM"
            },
            "receiver-rewards": 0,
            "round-time": 1703439471,
            "sender": "TDV4LF2HO7NWHQPDQWTQWXWXKZ4W6N7UA2N6GJ6PKP6WSP6J2YIPUCQNHM",
            "sender-rewards": 0,
            "signature": {
              "logicsig": {
                "args": [],
                "logic": "BiACAQAyBIECEjMAECISEDMBECISEEAAAQAzABAiEjMAAIAgmuynOZoqgz+a/xcbx+bwgMhYYxATBclcyl1ZYTKM4XQSEDMABzMBABIQMwAgMgMSEDMACTIDEhAzARAiEjMBCCMSEDMBADMBBxIQMwEFVwAHgAdpcGZzOi8vEhAzAQEjEhAzASAyAxIQMwEJMgMSEBBD"
              }
            },
            "tx-type": "pay"
          }`
        ) satisfies TransactionResult
      },
    }
  },
}
