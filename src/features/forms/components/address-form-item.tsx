import { FieldPath, useFormContext } from 'react-hook-form'
import { FormItemProps } from '@/features/forms/components/form-item'
import { TextFormItem } from './text-form-item'
import { addressFieldSchema, optionalAddressFieldSchema } from '@/features/transaction-wizard/data/common'
import { useDebounce } from 'use-debounce'
import { isNfd, useLoadableForwardLookupNfdResult } from '@/features/nfd/data'
import { useCallback, useEffect } from 'react'
import { ellipseAddress } from '@/utils/ellipse-address'
import { isAddress } from '@/utils/is-address'
import { z } from 'zod'

export type AddressOrNfdFieldSchema = z.infer<typeof addressFieldSchema>
export type OptionalAddressOrNfdFieldSchema = z.infer<typeof optionalAddressFieldSchema>
export type OptionalSenderFieldSchema = z.infer<typeof optionalAddressFieldSchema>

export interface AddressFieldProps<TSchema extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<FormItemProps<TSchema>, 'children'> {
  placeholder?: string
}

export interface AddressFormItemProps extends AddressFieldProps<AddressOrNfdFieldSchema | OptionalAddressOrNfdFieldSchema> {
  resolvedAddressField: FieldPath<AddressOrNfdFieldSchema | OptionalAddressOrNfdFieldSchema>
}

type ResolveNfdAddressProps = {
  nfd: string
  onNfdResolved: (address: string) => void
}

function ResolveNfdAddress({ nfd, onNfdResolved }: ResolveNfdAddressProps) {
  const [debouncedNfd] = useDebounce(nfd, 500)
  const loadableNfdResult = useLoadableForwardLookupNfdResult(debouncedNfd)

  useEffect(() => {
    if (loadableNfdResult.state !== 'loading') {
      const nfd = loadableNfdResult.state === 'hasData' ? loadableNfdResult.data : null
      onNfdResolved(nfd ? nfd.depositAccount : '')
    }
  }, [loadableNfdResult, onNfdResolved])

  return undefined
}

export function AddressFormItem({ field, resolvedAddressField, label, ...props }: AddressFormItemProps) {
  const { watch, setValue } = useFormContext<OptionalAddressOrNfdFieldSchema>()
  const rawValue = watch(field)

  //type guard
  const value = typeof rawValue === 'string' ? rawValue : ''

  const rawResolved = watch(resolvedAddressField)
  const resolvedAddress = typeof rawResolved === 'string' ? rawResolved : ''

  const setAddress = useCallback((address: string) => setValue(resolvedAddressField, address), [resolvedAddressField, setValue])
  useEffect(() => {
    if (value && isAddress(value)) {
      setAddress(value)
    } else if ((!value && resolvedAddress) || (value && !isAddress(value) && !isNfd(value))) {
      setAddress('')
    }
  }, [resolvedAddress, setAddress, value])

  return (
    <>
      {value && isNfd(value) && <ResolveNfdAddress nfd={value} onNfdResolved={setAddress} />}
      <TextFormItem
        {...props}
        field={field}
        label={
          <span className="flex items-center gap-1.5">
            {label}
            {value && isNfd(value) && resolvedAddress ? ` (${ellipseAddress(resolvedAddress)})` : ''}
          </span>
        }
      />
    </>
  )
}
