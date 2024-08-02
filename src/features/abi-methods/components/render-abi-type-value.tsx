import { useMemo } from 'react'
import algosdk from 'algosdk'
import { RenderABIArrayValues } from '@/features/abi-methods/components/render-abi-array-values'
import { RenderABITupleValues } from '@/features/abi-methods/components/render-abi-tuple-values'

type Props = {
  type: algosdk.ABIType
  value: algosdk.ABIValue
}

export function RenderABIValue({ type, value }: Props) {
  return useMemo(() => {
    if (isTupleType(type)) {
      return <RenderABITupleValues type={type as algosdk.ABITupleType} values={value as algosdk.ABIValue[]} />
    }
    if (isStaticArrayType(type)) {
      return <RenderABIArrayValues type={type as algosdk.ABIArrayStaticType} values={value as algosdk.ABIValue[]} />
    }
    if (isDynamicArrayType(type)) {
      return <RenderABIArrayValues type={type as algosdk.ABIArrayDynamicType} values={value as algosdk.ABIValue[]} />
    }
    if (type.toString() === 'string') {
      return `"${value}"`
    }
    return `${value}`
  }, [type, value])
}

const isTupleType = (type: algosdk.ABIType) =>
  type.toString().length > 2 && type.toString().startsWith('(') && type.toString().endsWith(')')
const isStaticArrayType = (type: algosdk.ABIType) => type.toString().endsWith('[]')
const isDynamicArrayType = (type: algosdk.ABIType) => type.toString().endsWith(']')
