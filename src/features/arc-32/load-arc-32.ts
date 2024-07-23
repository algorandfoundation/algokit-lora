import { Schema, Validator } from 'jsonschema'
import { AlgoAppSpec } from './application'
import appJsonSchema from './application.schema.json' with { type: 'json' }
import contractSchema from './contract.schema.json' with { type: 'json' }

export function loadArc32AppSpec(json: unknown): AlgoAppSpec {
  const validator = new Validator()
  validator.addSchema(contractSchema, '/contract.schema.json')

  const result = validator.validate(json, appJsonSchema as unknown as Schema)

  if (!result.valid) throw new Error(result.toString())

  return json as AlgoAppSpec
}
