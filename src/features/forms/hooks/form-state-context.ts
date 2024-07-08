import { createContext, useContext } from 'react'
import { useFormContext } from 'react-hook-form'
import type { z } from 'zod'

const FormStateContext = createContext<{
  submitting: boolean
  validator: z.ZodTypeAny | undefined
}>({
  submitting: false,
  validator: undefined,
})

/**
 * Used to override the schema resolved by useFieldMetaData for a particular path.
 * This is useful for union types which can't otherwise be resolved to a specific type.
 */
const SubSchemaFormContext = createContext<{
  schema: z.ZodTypeAny | undefined
  path: string | undefined
}>({
  path: undefined,
  schema: undefined,
})

export const FormStateContextProvider = FormStateContext.Provider

export const SubSchemaFormContextProvider = SubSchemaFormContext.Provider

export const useFormState = () => {
  return useContext(FormStateContext)
}

export const useFieldMetaData = (field: string) => {
  const { schema: subSchema, path } = useContext(SubSchemaFormContext)
  const { validator } = useContext(FormStateContext)

  const applicableSubSchema = useApplicableSchema(subSchema, field)
  const applicableSchema = useApplicableSchema(validator?._def.schema, field)

  if (applicableSubSchema && path && field.startsWith(path)) {
    const fieldSchema = getDeepPropertyOfSchema(applicableSubSchema, field.substring(path.length + 1).split('.'))
    return {
      required: !fieldSchema.isOptional(),
    }
  }

  if (validator === undefined) {
    return {
      required: false,
    }
  }

  const fieldSchema = getDeepPropertyOfSchema(applicableSchema!, field.split('.'))
  return {
    required: validator && !fieldSchema.isOptional(),
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
  }
  if (!isZodObject(schema)) {
    throw new Error(`Can't access property '${first}' of schema this is not an object`)
  }
  if (first in schema.shape) {
    const firstSchema = schema.shape[first]
    return getDeepPropertyOfSchema(firstSchema, rest)
  }
  throw new Error(`Property '${first}' does not exist on schema: ${Object.keys(schema.shape).join(', ')}`)
}

function isZodObject(schema: z.ZodTypeAny): schema is z.ZodObject<Record<string, z.ZodTypeAny>, any, any> {
  return schema._def.typeName === 'ZodObject'
}

function isZodArray(schema: z.ZodTypeAny): schema is z.ZodArray<z.ZodTypeAny> {
  return schema._def.typeName === 'ZodArray'
}

function isZodDiscriminatedUnion(schema: z.ZodTypeAny): schema is z.ZodDiscriminatedUnion<any, any> {
  return schema._def.typeName === 'ZodDiscriminatedUnion'
}
