export const fixedPointDecimalStringToBigInt = (s: string, decimalScale: number): bigint => {
  const [int, frac] = s.split('.')
  const intBigInt = BigInt(int.padEnd(int.length + decimalScale, '0'))
  const fracBigInt = frac ? BigInt(frac.padEnd(decimalScale, '0')) : BigInt(0)
  return intBigInt + fracBigInt
}

export const bigIntToFixedPointDecimalString = (value: bigint, decimalScale: number): string => {
  const valueString = value.toString()
  const numberString = valueString.slice(0, valueString.length - decimalScale)
  const fractionString = valueString.slice(valueString.length - decimalScale)
  return `${numberString}.${fractionString}`
}
