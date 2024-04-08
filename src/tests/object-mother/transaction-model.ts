import { transactionResultBuilder } from '../builders/transaction-result-builder'

export const transactionModelMother = {
  simplePaymentTransaction: () => {
    return transactionResultBuilder()
      .withId('FBORGSDC4ULLWHWZUMUFIYQLSDC26HGLTFD7EATQDY37FHCIYBBQ')
      .withConfirmedRound(36570178)
      .withRoundTime(1709189521)
      .withSender('M3IAMWFYEIJWLWFIIOEDFOLGIVMEOB3F4I3CA4BIAHJENHUUSX63APOXXM')
      .withReceiver('KIZLH4HUM5ZIB5RVP6DR2IGXB44TGJ6HZUZIAYZFZ63KWCAQB2EZGPU5BQ')
      .withAmount(236070000)
      .withFee(1000)
  },
}
