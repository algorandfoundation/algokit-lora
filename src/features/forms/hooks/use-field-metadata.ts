import { useContext } from 'react'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { FormStateContext } from './form-state-context'

export const useFieldMetadata = (field: string) => {
  const { schema } = useContext(FormStateContext)

  const applicableSchema = useApplicableSchema(schema?._def.schema, field)

  if (schema === undefined) {
    return {
      required: false,
    }
  }

  const fieldSchema = getDeepPropertyOfSchema(applicableSchema!, field.split('.'))
  return {
    required: schema && !fieldSchema.isOptional(),
  }
}

export const useApplicableSchema = (schema: z.ZodTypeAny | undefined, field: string) => {
  const { getValues, watch } = useFormContext()

  const isDiscriminatedUnionSchema = schema && isZodDiscriminatedUnion(schema)
  if (!isDiscriminatedUnionSchema) {
    return schema
  }

  if (schema.discriminator === field) {
    watch(field)
  }

  const discriminatorValue = getValues(schema.discriminator)
  return schema.optionsMap.get(discriminatorValue)!
}

function getDeepPropertyOfSchema(schema: z.ZodTypeAny, path: string[]): z.ZodTypeAny {
  if (path.length === 0) return schema

  const [first, ...rest] = path

  if (!isNaN(Number(first))) {
    // probably array access
    if (isZodArray(schema)) {
      return getDeepPropertyOfSchema(schema._def.type, rest)
    }
  } else if (isZodObject(schema)) {
    if (first in schema.shape) {
      const firstSchema = schema.shape[first]
      return getDeepPropertyOfSchema(firstSchema, rest)
    }
    throw new Error(`Property '${first}' does not exist on schema: ${Object.keys(schema.shape).join(', ')}`)
  } else if (isZodEffects(schema)) {
    return getDeepPropertyOfSchema(schema._def.schema, path)
  } else if (isZodOptional(schema)) {
    return getDeepPropertyOfSchema(schema._def.innerType, path)
  }

  return schema
}

function isZodOptional(schema: z.ZodTypeAny): schema is z.ZodOptional<z.ZodTypeAny> {
  return schema._def.typeName === 'ZodOptional'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isZodEffects(schema: z.ZodTypeAny): schema is z.ZodEffects<z.ZodTypeAny, any, any> {
  return schema._def.typeName === 'ZodEffects'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isZodObject(schema: z.ZodTypeAny): schema is z.ZodObject<Record<string, z.ZodTypeAny>, any, any> {
  return schema._def.typeName === 'ZodObject'
}

function isZodArray(schema: z.ZodTypeAny): schema is z.ZodArray<z.ZodTypeAny> {
  return schema._def.typeName === 'ZodArray'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isZodDiscriminatedUnion(schema: z.ZodTypeAny): schema is z.ZodDiscriminatedUnion<any, any> {
  return schema._def.typeName === 'ZodDiscriminatedUnion'
}
