/* eslint-disable @typescript-eslint/no-explicit-any */
import { StructDefinition } from '@/features/applications/models'
import { z } from 'zod'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import React from 'react'
import {
  ABITypeTemplateParam,
  UnknownTypeTemplateParam,
  TemplateParamType,
  AVMTypeTemplateParam,
} from '@/features/app-interfaces/data/types'
import { ABIType, AVMType } from '@algorandfoundation/algokit-utils/abi'
import { AbiFormItemValue, AvmFormItemValue } from '@/features/abi-methods/models'

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
      toTemplateParam: (value: AvmFormItemValue) => AVMTypeTemplateParam
      fromTemplateParam: (templateParam: AVMTypeTemplateParam) => AvmFormItemValue
      defaultValue?: AvmFormItemValue
    }
  | {
      name: string
      path: string
      type: ABIType
      struct?: StructDefinition
      fieldSchema: z.ZodTypeAny
      createField: (helper: FormFieldHelper<any>) => React.JSX.Element | undefined
      toTemplateParam: (value: AbiFormItemValue) => ABITypeTemplateParam
      fromTemplateParam: (templateParam: ABITypeTemplateParam) => AbiFormItemValue
      defaultValue?: AbiFormItemValue
    }

export type TealTemplateParamDefinition = {
  name: string
  type?: ABIType | AVMType
  struct?: StructDefinition
  defaultValue?: AbiFormItemValue | AvmFormItemValue
}

export type TealUnknownTypeTemplateParamFieldValue = { type: TemplateParamType; value: string }
export type TealTemplateParamFieldValue = AbiFormItemValue | TealUnknownTypeTemplateParamFieldValue | AvmFormItemValue
