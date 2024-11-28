import { useMemo } from 'react'
import { DecodedAbiStorageValue } from './decoded-abi-storage-value'
import { DescriptionList } from '@/features/common/components/description-list'
import { DecodedAbiStorageKey as DecodedAbiStorageKeyModel } from '../models'

export function DecodedAbiStorageKey({ storageKey }: { storageKey: DecodedAbiStorageKeyModel }) {
  const items = useMemo(() => {
    return [
      {
        dt: 'Type',
        dd: storageKey.type,
      },
      ...(storageKey.prefix ? [{ dt: 'AppSpec Prefix', dd: storageKey.prefix }] : []),
      {
        dt: 'Value',
        dd: <DecodedAbiStorageValue value={storageKey} />,
      },
    ]
  }, [storageKey])

  return <DescriptionList items={items} dtClassName="min-w-32" />
}
