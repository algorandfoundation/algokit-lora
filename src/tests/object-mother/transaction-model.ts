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
}
