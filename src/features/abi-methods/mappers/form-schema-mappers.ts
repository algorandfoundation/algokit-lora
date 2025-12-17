import algosdk from 'algosdk'
import { z } from 'zod'
import { bigIntSchema, numberSchema } from '@/features/forms/data/common'
import { zfd } from 'zod-form-data'
import { addressFieldSchema, optionalAddressFieldSchema } from '@/features/transaction-wizard/data/common'
import { fixedPointDecimalStringToBigInt } from '@/features/abi-methods/mappers/ufixed-mappers'
import { AVMType } from '@algorandfoundation/algokit-utils/abi'

export const abiTypeToFormFieldSchema = (type: algosdk.ABIType, isOptional: boolean): z.ZodTypeAny => {
  if (type instanceof algosdk.ABIUintType) {
    const max = BigInt(2 ** type.bitSize) - BigInt(1)
    const uintSchema = z.bigint().min(BigInt(0)).max(max, `Value must be less than or equal to ${max}`)
    return bigIntSchema(isOptional ? uintSchema.optional() : uintSchema)
  }
  if (type instanceof algosdk.ABIByteType) {
    const byteSchema = z.number().min(0).max(255, `Value must be less than or equal to 255`)
    return numberSchema(isOptional ? byteSchema.optional() : byteSchema)
  }
  if (type instanceof algosdk.ABIBoolType) {
    const boolSchema = z
      .string()
      .toLowerCase()
      .transform((text) => JSON.parse(text))
      .pipe(z.boolean())
    return isOptional ? boolSchema.optional() : boolSchema
  }
  if (type instanceof algosdk.ABIUfixedType) {
    const max = BigInt(2 ** type.bitSize) - BigInt(1)
    const stringSchema = isOptional ? z.string().optional() : z.string()

    return zfd.text(
      stringSchema
        .refine((s) => s === undefined || s.split('.').length === 1 || s.split('.')[1].length <= type.precision, {
          message: `Decimal precision must be less than ${type.precision}`,
        })
        .refine(
          (s) => s === undefined || fixedPointDecimalStringToBigInt(s, type.precision) <= max,
          (s) => ({
            message: `The value ${s} is too big to fit in type ${type.toString()}`,
          })
        )
    )
  }
  if (type instanceof algosdk.ABIArrayStaticType) {
    if (type.childType instanceof algosdk.ABIByteType) {
      return isOptional ? zfd.text().optional() : zfd.text()
    } else {
      return z.array(abiTypeToFormFieldSchema(type.childType, false)).min(type.staticLength).max(type.staticLength)
    }
  }
  if (type instanceof algosdk.ABIAddressType) {
    return isOptional ? optionalAddressFieldSchema : addressFieldSchema
  }
  if (type instanceof algosdk.ABIArrayDynamicType) {
    if (type.childType instanceof algosdk.ABIByteType) {
      return isOptional ? zfd.text().optional() : zfd.text()
    } else {
      return z.array(
        z.object({
          id: z.string(),
          child: abiTypeToFormFieldSchema(type.childType, false),
        })
      )
    }
  }
  if (type instanceof algosdk.ABIStringType) {
    return isOptional ? zfd.text().optional() : zfd.text()
  }
  if (type instanceof algosdk.ABITupleType) {
    const childTypes = type.childTypes.map((childType) => abiTypeToFormFieldSchema(childType, false))
    return z.tuple(childTypes as [z.ZodTypeAny, ...z.ZodTypeAny[]])
  }

  return zfd.text()
}

export const abiReferenceTypeToFormFieldSchema = (type: algosdk.ABIReferenceType): z.ZodTypeAny => {
  if (type === algosdk.ABIReferenceType.asset || type === algosdk.ABIReferenceType.application) {
    return bigIntSchema(z.bigint().min(0n))
  }
  if (type === algosdk.ABIReferenceType.account) {
    return addressFieldSchema
  }
  return zfd.text()
}

export const avmTypeToFormFieldSchema = (type: AVMType): z.ZodTypeAny => {
  if (type === 'AVMUint64') {
    return bigIntSchema(z.bigint())
  }
  return zfd.text()
}
