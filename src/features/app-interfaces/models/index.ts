/* eslint-disable @typescript-eslint/no-explicit-any */
import { StructDefinition } from '@/features/applications/models'
import algosdk from 'algosdk'
import { z } from 'zod'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import React from 'react'
import {
  ABITypeTemplateParam,
  UnknownTypeTemplateParam,
  TemplateParamType,
  AVMTypeTemplateParam,
} from '@/features/app-interfaces/data/types'
import { AVMType } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { AbiFormItemValue, AvmValue } from '@/features/abi-methods/models'

export type TealTemplateParamField =
  | {
      name: string
      path: string
      fieldSchema: z.ZodTypeAny
      createField: (helper: FormFieldHelper<any>) => React.JSX.Element | undefined
      toTemplateParam: (value: TealUnknownTypeTemplateParamFieldValue) => UnknownTypeTemplateParam
      fromTemplateParam: (templateParam: UnknownTypeTemplateParam) => TealUnknownTypeTemplateParamFieldValue
    }
  | {
      name: string
      path: string
      type: AVMType
      fieldSchema: z.ZodTypeAny
      createField: (helper: FormFieldHelper<any>) => React.JSX.Element | undefined
      toTemplateParam: (value: AvmValue) => AVMTypeTemplateParam
      fromTemplateParam: (templateParam: AVMTypeTemplateParam) => AvmValue
      defaultValue?: AvmValue
    }
  | {
      name: string
      path: string
      type: algosdk.ABIType
      struct?: StructDefinition
      fieldSchema: z.ZodTypeAny
      createField: (helper: FormFieldHelper<any>) => React.JSX.Element | undefined
      toTemplateParam: (value: AbiFormItemValue) => ABITypeTemplateParam
      fromTemplateParam: (templateParam: ABITypeTemplateParam) => AbiFormItemValue
      defaultValue?: AbiFormItemValue
    }

export type TealTemplateParamDefinition = {
  name: string
  type?: algosdk.ABIType | AVMType
  struct?: StructDefinition
  defaultValue?: AbiFormItemValue | AvmValue
}

export type TealUnknownTypeTemplateParamFieldValue = { type: TemplateParamType; value: string }
export type TealTemplateParamFieldValue = AbiFormItemValue | TealUnknownTypeTemplateParamFieldValue | AvmValue
