import { Schema, Validator } from 'jsonschema'
import Arc4ContractSchema from '@/features/abi-methods/mappers/arc-4-json-schemas/arc4-contract.schema.json'
import Arc32AppJsonSchema from '@/features/abi-methods/mappers/arc-32-json-schemas/arc32-application.schema.json'
import { Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
import {
  AbiArrayRender,
  AbiArrayValue,
  AbiMethodArgument,
  AbiMethodArgumentRender,
  AbiTupleRender,
  AbiTupleValue,
  AbiType,
  AbiValue,
  AbiValueRender,
} from '@/features/abi-methods/models'
import { sum } from '@/utils/sum'

export const jsonAsArc32AppSpec = (json: unknown): Arc32AppSpec => {
  const validator = new Validator()
  validator.addSchema(Arc4ContractSchema, '/arc4-contract.schema.json')
  const result = validator.validate(json, Arc32AppJsonSchema as unknown as Schema)
  if (!result.valid) throw new Error(result.toString())
  return json as Arc32AppSpec
}

export const jsonAsArc4AppSpec = (json: unknown): Arc4AppSpec => {
  const validator = new Validator()

  const result = validator.validate(json, Arc4ContractSchema as unknown as Schema)

  if (!result.valid) throw new Error(result.toString())

  return json as Arc4AppSpec
}

export const asAbiMethodArgumentRender = (abiMethodArgument: AbiMethodArgument): AbiMethodArgumentRender => {
  if (
    abiMethodArgument.type === AbiType.Address ||
    abiMethodArgument.type === AbiType.Application ||
    abiMethodArgument.type === AbiType.Account ||
    abiMethodArgument.type === AbiType.Transaction ||
    abiMethodArgument.type === AbiType.Asset
  ) {
    return {
      ...abiMethodArgument,
      multiLine: false,
      length: `${abiMethodArgument.value}`.length,
    }
  }
  return {
    ...abiMethodArgument,
    ...asAbiValueRender(abiMethodArgument),
  }
}

export const asAbiValueRender = (abiValue: AbiValue): AbiValueRender => {
  if (abiValue.type === AbiType.Tuple) {
    return asAbiTupleRender(abiValue)
  }
  if (abiValue.type === AbiType.Array) {
    return asAbiArrayRender(abiValue)
  }
  return {
    ...abiValue,
    multiLine: false,
    length: `${abiValue.value}`.length,
  }
}

const asAbiTupleRender = (abiTuple: AbiTupleValue): AbiTupleRender => {
  const valuesRender = abiTuple.values.map((value) => asAbiValueRender(value))
  const length = sum(valuesRender.map((r) => r.length))
  const multiLine = valuesRender.some((value) => value.multiLine) || length > 90
  return {
    type: AbiType.Tuple,
    values: valuesRender,
    multiLine: multiLine,
    length: length,
  }
}

const asAbiArrayRender = (abiArray: AbiArrayValue): AbiArrayRender => {
  const valuesRender = abiArray.values.map((value) => asAbiValueRender(value))
  const length = sum(valuesRender.map((r) => r.length))
  const multiLine = valuesRender.some((value) => value.multiLine) || length > 90
  return {
    type: AbiType.Array,
    values: valuesRender,
    multiLine: multiLine,
    length: length,
  }
}
