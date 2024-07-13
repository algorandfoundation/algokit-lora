/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import { DefaultValues, FormProvider, useForm } from 'react-hook-form'
import { useCallback, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormStateContextProvider } from '@/features/forms/hooks/form-state-context'
import { cn } from '@/features/common/utils'

import { FormFieldHelper } from '@/features/forms/components/form-field-helper'

export interface ValidatedFormProps<TData, TSchema extends Record<string, any>> {
  className?: string
  children: React.ReactNode | ((helper: FormFieldHelper<TSchema>) => React.ReactNode)
  validator: z.ZodEffects<any, TSchema, any>
  defaultValues?: DefaultValues<TSchema>

  onSubmit?(values: TSchema): Promise<TData>
}

export function ValidatedForm<TData, TSchema extends Record<string, any>>({
  className,
  children,
  validator,
  defaultValues,
  onSubmit: onSubmitProp,
}: ValidatedFormProps<TData, TSchema>) {
  const [submitting, setSubmitting] = useState(false)
  const formCtx = useForm<TSchema>({
    resolver: zodResolver(validator),
    defaultValues,
    mode: 'onBlur',
  })

  const onSubmit = useCallback(
    async (values: TSchema) => {
      setSubmitting(true)
      try {
        await onSubmitProp?.(values)
      } finally {
        setSubmitting(false)
      }
    },
    [onSubmitProp]
  )

  const handleSubmit = onSubmit && formCtx.handleSubmit(onSubmit)

  return (
    <FormStateContextProvider
      value={{
        submitting,
        validator,
      }}
    >
      <FormProvider {...formCtx}>
        <form className={cn(className)} onSubmit={handleSubmit}>
          {typeof children === 'function' ? children(new FormFieldHelper<TSchema>()) : children}
        </form>
      </FormProvider>
    </FormStateContextProvider>
  )
}
