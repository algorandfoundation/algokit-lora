import { transactionResultBuilder } from '../builders/transaction-result-builder'

export const transactionModelMother = {
  simplePaymentTransaction: () => {
    return transactionResultBuilder()
      .withId('FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ')
      ['withConfirmed-round'](36570178)
      ['withRound-time'](1709189521)
      .withSender('M3IAMWFYEIJWLWFIIOEDFOLGIVMEOB3F4I3CA4BIAHJENHUUSX63APOXXM')
      ['withPayment-transaction']({
        amount: 236070000,
        receiver: 'KIZLH4HUM5ZIB5RVP6DR2IGXB44TGJ6HZUZIAYZFZ63KWCAQB2EZGPU5BQ',
      })
      .withFee(1000)
  },
}
