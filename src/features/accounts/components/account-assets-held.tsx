import { Address } from '../data/types'

type Props = {
  address: Address
}

export function AccountAssetHeld({ address }: Props) {
  return <>Assets Held for {address}</>
}
