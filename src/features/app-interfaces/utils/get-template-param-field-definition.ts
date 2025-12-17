import { Arc56Contract } from '@algorandfoundation/algokit-utils/abi'
import algosdk from 'algosdk'
import { TealTemplateParamDefinition } from '../models'
import { asStructDefinition } from '@/features/applications/mappers'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import { isAVMType } from './is-avm-type'
import { asAbiFormItemValue } from '@/features/abi-methods/mappers/form-item-value-mappers'
import { asAvmValue } from '@/features/abi-methods/mappers'
import { asAbiOrAvmType } from '@/features/abi-methods/mappers'

export const getTemplateParamDefinition = (appSpec: Arc56Contract, paramName: string): TealTemplateParamDefinition => {
  const templateVariable = appSpec.templateVariables ? appSpec.templateVariables[paramName] : undefined

  if (!templateVariable) {
    return {
      name: paramName,
    }
  }

  const type = asAbiOrAvmType(appSpec, templateVariable.type)

  const getValue = () => {
    if (!templateVariable.value) return undefined
    if (isAVMType(type)) {
      return asAvmValue(type, templateVariable.value)
    }

    // Convert algokit-utils ABIType to algosdk ABIType for asAbiFormItemValue
    const algosdkType = algosdk.ABIType.from(type.toString())
    return asAbiFormItemValue(algosdkType, type.decode(base64ToBytes(templateVariable.value)) as algosdk.ABIValue)
  }

  return {
    name: paramName,
    type: type,
    defaultValue: getValue(),
    struct: appSpec.structs[templateVariable.type] ? asStructDefinition(templateVariable.type, appSpec.structs) : undefined,
  }
}
