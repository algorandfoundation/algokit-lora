import { Arc56Contract, AVMType, getABITupleTypeFromABIStructDefinition } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { TealTemplateParamDefinition } from '../models'
import { getStructDefinition } from '@/features/applications/mappers'
import { base64ToBytes } from '@/utils/base64-to-bytes'
import algosdk from 'algosdk'
import { isAVMType } from './is-avm-type'
import { asTealAVMTypeTemplateParamFieldValue, asFormItemValue } from '../mappers'

export const getTemplateParamDefinition = (appSpec: Arc56Contract, paramName: string): TealTemplateParamDefinition => {
  const templateVariable = appSpec.templateVariables ? appSpec.templateVariables[paramName] : undefined

  if (!templateVariable) {
    return {
      name: paramName,
    }
  }

  const getType = (): algosdk.ABIType | AVMType => {
    if (appSpec.structs[templateVariable.type]) {
      return getABITupleTypeFromABIStructDefinition(appSpec.structs[templateVariable.type], appSpec.structs)
    }
    if (isAVMType(templateVariable.type)) {
      return templateVariable.type
    }
    return algosdk.ABIType.from(templateVariable.type)
  }

  const type = getType()

  const getValue = () => {
    if (!templateVariable.value) return undefined
    if (isAVMType(type)) {
      return asTealAVMTypeTemplateParamFieldValue(type, templateVariable.value)
    }

    return asFormItemValue(type, type.decode(base64ToBytes(templateVariable.value)))
  }

  return {
    name: paramName,
    type: type,
    defaultValue: getValue(),
    struct: appSpec.structs[templateVariable.type] ? getStructDefinition(templateVariable.type, appSpec.structs) : undefined,
  }
}
