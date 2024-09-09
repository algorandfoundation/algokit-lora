import { Schema, Validator } from 'jsonschema'
import Arc4ContractSchema from '@/features/abi-methods/mappers/arc-4-json-schemas/arc4-contract.schema.json'
import Arc32AppJsonSchema from '@/features/abi-methods/mappers/arc-32-json-schemas/arc32-application.schema.json'
import { Arc32AppSpec, Arc4AppSpec } from '@/features/app-interfaces/data/types'
import {
  AbiArrayRepresentation,
  AbiArrayValue,
  AbiMethod,
  AbiMethodArgument,
  AbiMethodArgumentRepresentation,
  AbiMethodRepresentation,
  AbiTupleRepresentation,
  AbiTupleValue,
  AbiType,
  AbiValue,
  AbiValueRepresentation,
} from '@/features/abi-methods/models'
import { sum } from '@/utils/sum'

const MAX_LENGTH = 20

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

export const asAbiMethodArgumentRepresentation = (abiMethodArgument: AbiMethodArgument): AbiMethodArgumentRepresentation => {
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
  const resolvedArgument = asAbiValueRepresentation(abiMethodArgument)
  const multiLine = sum([resolvedArgument.length]) > MAX_LENGTH

  return {
    ...abiMethodArgument,
    ...resolvedArgument,
    multiLine: multiLine,
  }
}

export function getAbiMethodRepresentation(method: AbiMethod): AbiMethodRepresentation {
  const argumentRepresentationList = method.arguments.map((argument) => asAbiMethodArgumentRepresentation(argument))
  const multiLine =
    argumentRepresentationList.some((argument) => argument.multiLine) ||
    sum(argumentRepresentationList.map((arg) => arg.length)) > MAX_LENGTH
  return {
    name: method.name,
    arguments: argumentRepresentationList,
    multiLine: multiLine,
    return: method.return,
  }
}

export const asAbiValueRepresentation = (abiValue: AbiValue): AbiValueRepresentation => {
  if (abiValue.type === AbiType.Tuple) {
    return asAbiTupleRepresentation(abiValue)
  }
  if (abiValue.type === AbiType.Array) {
    return asAbiArrayRepresentation(abiValue)
  }
  return {
    ...abiValue,
    multiLine: false,
    length: `${abiValue.value}`.length,
  }
}

const asAbiTupleRepresentation = (abiTuple: AbiTupleValue): AbiTupleRepresentation => {
  const valueRepresentation = abiTuple.values.map((value) => asAbiValueRepresentation(value))
  const length = sum(valueRepresentation.map((r) => r.length))
  const multiLine = valueRepresentation.some((value) => value.multiLine) || length > MAX_LENGTH
  return {
    type: AbiType.Tuple,
    values: valueRepresentation,
    multiLine: multiLine,
    length: length,
  }
}

const asAbiArrayRepresentation = (abiArray: AbiArrayValue): AbiArrayRepresentation => {
  const valueRepresentation = abiArray.values.map((value) => asAbiValueRepresentation(value))
  const length = sum(valueRepresentation.map((r) => r.length))
  const multiLine = valueRepresentation.some((value) => value.multiLine) || length > MAX_LENGTH
  return {
    type: AbiType.Array,
    values: valueRepresentation,
    multiLine: multiLine,
    length: length,
  }
}
