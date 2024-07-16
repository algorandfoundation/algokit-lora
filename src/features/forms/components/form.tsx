/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import { DefaultValues, FormProvider, useForm } from 'react-hook-form'
import { ReactNode, useCallback, useState } from 'react'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { FormStateContextProvider } from '@/features/forms/hooks/form-state-context'
import { zodResolver } from '@hookform/resolvers/zod'
import { asError } from '@/utils/error'

export interface FormProps<TData, TSchema extends Record<string, any>> {
  className?: string
  header?: string
  schema: z.ZodEffects<any, TSchema, any>
  defaultValues?: DefaultValues<TSchema>
  children: ReactNode | ((helper: FormFieldHelper<TSchema>) => ReactNode)
  formAction: ReactNode
  onSuccess: (data: TData) => void
  onSubmit: (values: z.infer<z.ZodEffects<any, TSchema, any>>) => Promise<TData>
}

export function Form<TData, TSchema extends Record<string, any>>({
  header,
  schema,
  children,
  formAction,
  defaultValues,
  onSubmit: onSubmitProp,
  onSuccess,
}: FormProps<TData, TSchema>) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  const formCtx = useForm<TSchema>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  })

  const onSubmit = useCallback(
    async (values: z.infer<z.ZodEffects<any, TSchema, any>>) => {
      setSubmitting(true)
      setErrorMessage(undefined)
      try {
        const data = await onSubmitProp?.(values)
        onSuccess?.(data)
      } catch (error: unknown) {
        setErrorMessage(asError(error).message)
      } finally {
        setSubmitting(false)
      }
    },
    [onSubmitProp, onSuccess]
  )

  const handleSubmit = formCtx.handleSubmit(onSubmit)

  return (
    <div className={'grid'}>
      <h1>{header}</h1>
      <FormStateContextProvider
        value={{
          submitting,
        }}
      >
        <FormProvider {...formCtx}>
          <form className={'mt-4 grid gap-2'} onSubmit={handleSubmit}>
            {typeof children === 'function' ? children(new FormFieldHelper<TSchema>()) : children}
            {errorMessage && <div className="text-error">{errorMessage}</div>}
            {formAction}
          </form>
        </FormProvider>
      </FormStateContextProvider>
    </div>
  )
}
