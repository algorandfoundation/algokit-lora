import { randomNumber, randomNumberBetween } from './dossier'

export const randomBigInt = () => BigInt(randomNumber())

export const randomBigIntBetween = (min: bigint, max: bigint) => BigInt(randomNumberBetween(Number(min), Number(max)))
