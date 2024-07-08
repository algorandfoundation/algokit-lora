/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import { DefaultValues } from 'react-hook-form'
import { ReactNode, useCallback } from 'react'
import { ValidatedForm } from '@/features/forms/components/validated-form'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'

export interface FormProps<TData, TSchema extends Record<string, any>> {
  className?: string
  header?: string
  schema: z.ZodEffects<any, TSchema, any>
  defaultValues?: DefaultValues<TSchema>
  children: ReactNode | ((helper: FormFieldHelper<TSchema>) => ReactNode)
  onSuccess: (data: TData) => void
  onSubmit: (values: z.infer<z.ZodEffects<any, TSchema, any>>) => Promise<TData>
}

export function Form<TData, TSchema extends Record<string, any>>({
  header,
  schema,
  children,
  defaultValues,
  onSubmit: onSubmitProp,
  onSuccess,
}: FormProps<TData, TSchema>) {
  const onSubmit = useCallback(
    async (values: z.infer<z.ZodEffects<any, TSchema, any>>) => {
      const data = await onSubmitProp?.(values)
      onSuccess?.(data)
    },
    [onSubmitProp, onSuccess]
  )

  return (
    <div>
      <h1>{header}</h1>
      <ValidatedForm validator={schema} onSubmit={onSubmit} defaultValues={defaultValues}>
        {children}
      </ValidatedForm>
    </div>
  )
}
