export const isValidInnerTransactionId = (innerId: string) => {
  const regex = /^\d+(\/\d+)*$/
  return regex.test(innerId.toString())
}
