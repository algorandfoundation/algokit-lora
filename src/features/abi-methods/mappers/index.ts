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

export const asAbiMethodArgumentRender = (abiMethodArgument: AbiMethodArgument): AbiMethodArgumentRepresentation => {
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
  const renderedArgument = asAbiValueRender(abiMethodArgument)
  const multiLine = sum([renderedArgument.length]) > 20

  return {
    ...abiMethodArgument,
    ...renderedArgument,
    multiLine: multiLine,
  }
}

export function getAbiMethodRepresentation(method: AbiMethod): AbiMethodRepresentation {
  const argumentsRepresentation = method.arguments.map((argument) => asAbiMethodArgumentRender(argument))
  const multiLine =
    argumentsRepresentation.some((argument) => argument.multiLine) || sum(argumentsRepresentation.map((arg) => arg.length)) > 20
  return {
    name: method.name,
    arguments: argumentsRepresentation,
    multiLine: multiLine,
    return: method.return,
  }
}

export const asAbiValueRender = (abiValue: AbiValue): AbiValueRepresentation => {
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

const asAbiTupleRender = (abiTuple: AbiTupleValue): AbiTupleRepresentation => {
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

const asAbiArrayRender = (abiArray: AbiArrayValue): AbiArrayRepresentation => {
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
