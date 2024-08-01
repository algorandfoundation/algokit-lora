import { AlgoAppSpec } from '@/features/abi-methods/types/application'
import { Schema, Validator } from 'jsonschema'
import contractSchema from '@/features/abi-methods/types/contract.schema.json'
import appJsonSchema from '@/features/abi-methods/types/application.schema.json'

export const mapJsonToAppSpec = (json: unknown): AlgoAppSpec => {
  const validator = new Validator()
  validator.addSchema(contractSchema, '/contract.schema.json')

  const result = validator.validate(json, appJsonSchema as unknown as Schema)

  if (!result.valid) throw new Error(result.toString())

  return json as AlgoAppSpec
}
