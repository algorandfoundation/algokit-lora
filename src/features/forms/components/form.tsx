/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import { DefaultValues, FormProvider, useForm, UseFormReturn } from 'react-hook-form'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { FormStateContextProvider } from '@/features/forms/hooks/form-state-context'
import { zodResolver } from '@hookform/resolvers/zod'
import { asError } from '@/utils/error'
import { cn } from '@/features/common/utils'

export interface FormProps<TData, TSchema extends Record<string, unknown>> {
  className?: string
  header?: string
  schema: z.ZodEffects<any, TSchema, unknown>
  defaultValues?: DefaultValues<TSchema>
  children: ReactNode | ((helper: FormFieldHelper<TSchema>, handleSubmit: () => Promise<void>) => ReactNode)
  formAction: ReactNode | ((ctx: UseFormReturn<TSchema, any, undefined>, resetLocalState: () => void) => ReactNode)
  onSuccess?: (data: TData) => void
  onSubmit: (values: z.infer<z.ZodEffects<any, TSchema, unknown>>) => Promise<TData> | TData
  resetOnSuccess?: boolean
}

export function Form<TData, TSchema extends Record<string, unknown>>({
  className,
  header,
  schema,
  children,
  formAction,
  defaultValues,
  onSubmit: _onSubmit,
  onSuccess,
  resetOnSuccess,
}: FormProps<TData, TSchema>) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  const resetLocalState = useCallback(() => {
    setErrorMessage(undefined)
    setSubmitting(false)
  }, [])

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
        const data = await _onSubmit(values)
        onSuccess?.(data)
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.log(error)
        setErrorMessage(asError(error).message)
      } finally {
        setSubmitting(false)
      }
    },
    [_onSubmit, onSuccess]
  )

  const handleSubmit = useMemo(() => formCtx.handleSubmit(onSubmit), [formCtx, onSubmit])

  useEffect(() => {
    if (resetOnSuccess) {
      formCtx.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetOnSuccess, formCtx.formState.isSubmitSuccessful])

  return (
    <div className={'grid'}>
      {header && <h2>{header}</h2>}
      <FormStateContextProvider
        value={{
          submitting,
          schema,
        }}
      >
        <FormProvider {...formCtx}>
          <form className={cn('grid gap-4', className)} onSubmit={handleSubmit}>
            {typeof children === 'function' ? children(new FormFieldHelper<TSchema>(), handleSubmit) : children}
            {errorMessage && <div className="text-error">{errorMessage}</div>}
            {typeof formAction === 'function' ? formAction(formCtx, resetLocalState) : formAction}
          </form>
        </FormProvider>
      </FormStateContextProvider>
    </div>
  )
}
