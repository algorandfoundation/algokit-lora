import algosdk from 'algosdk'
import { RenderABIValue } from '@/features/abi-methods/components/render-abi-type-value'

type RenderABIArrayValuesProps = {
  type: algosdk.ABIArrayStaticType | algosdk.ABIArrayDynamicType
  values: algosdk.ABIValue[]
}

export function RenderABIArrayValues({ type, values }: RenderABIArrayValuesProps) {
  return (
    <>
      <>[</>
      <ul className={'pl-4'}>
        {values.map((value, index, array) => (
          <li key={index}>
            <RenderABIValue type={type.childType} value={value} />
            {index < array.length - 1 ? ',' : ''}
          </li>
        ))}
      </ul>
      <>]</>
    </>
  )
}
