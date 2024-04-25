import { isValidAddress } from 'algosdk'

export const isAddress = (id: string) => isValidAddress(id)
