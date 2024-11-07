import { Form } from '@/features/forms/components/form'
import { useCallback, useMemo } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { zfd } from 'zod-form-data'
import { algos } from '@algorandfoundation/algokit-utils'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { Address } from '@/features/accounts/data/types'
import SvgAlgorand from '@/features/common/components/icons/algorand'
import { invariant } from '@/utils/invariant'
import { isAddress } from '@/utils/is-address'
import { Loadable } from 'jotai/vanilla/utils/loadable'
import { RenderInlineLoadable } from '@/features/common/components/render-inline-loadable'
import { numberSchema } from '@/features/forms/data/common'

const receiverAddressLabel = 'Receiver address'
const amountLabel = 'Amount'

type Props = {
  onCreateReceiver?: () => Promise<Address>
  onSubmit: (receiver: Address, amount: AlgoAmount) => Promise<void>
  limit?: Loadable<Promise<AlgoAmount>>
  defaultReceiver?: string
}

export function FundAccountForm({ onCreateReceiver, onSubmit, limit, defaultReceiver }: Props) {
  const fundAccount = useCallback(
    async (values: z.infer<typeof fundFormSchema>) => {
      const receiver = onCreateReceiver ? await onCreateReceiver() : values.receiver
      invariant(receiver, 'Receiver is required')
      await onSubmit(receiver, algos(values.amount))
      toast.success('Account funded successfully')
    },
    [onCreateReceiver, onSubmit]
  )

  const fundFormSchema = useMemo(() => {
    return zfd.formData({
      receiver: zfd
        .text()
        .optional()
        .superRefine((receiver, ctx) => {
          if (onCreateReceiver) {
            return
          }

          if (!receiver) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Required',
            })
          } else if (!isAddress(receiver)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Invalid address',
            })
          }
        }),
      amount: numberSchema(
        z
          .number({ required_error: 'Required', invalid_type_error: 'Required' })
          .min(0.1)
          .refine((value) => (limit && limit.state === 'hasData' ? value <= limit.data.algos : true), {
            message: `${limit && limit.state === 'hasData' ? `${limit.data.algos} ` : ''}ALGO limit exceeded`,
          })
      ),
    })
  }, [limit, onCreateReceiver])

  return (
    <Form
      schema={fundFormSchema}
      defaultValues={{ receiver: defaultReceiver, amount: '' as unknown as undefined }}
      onSubmit={fundAccount}
      formAction={
        <FormActions>
          <SubmitButton>{onCreateReceiver ? 'Create and Fund' : 'Fund'}</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <>
          {!onCreateReceiver &&
            helper.textField({
              label: receiverAddressLabel,
              field: 'receiver',
              placeholder: ZERO_ADDRESS,
            })}
          {helper.numberField({
            label: (
              <span className="flex items-center gap-1.5">
                {amountLabel}
                <SvgAlgorand className="h-auto w-3" />
              </span>
            ),
            field: 'amount',
            placeholder: (1).toString(),
            helpText: limit ? (
              <span className="flex items-center">
                <RenderInlineLoadable loadable={limit}>{(limit) => limit.algos}</RenderInlineLoadable>&nbsp;ALGO available
              </span>
            ) : undefined,
            decimalScale: 6,
            thousandSeparator: true,
          })}
        </>
      )}
    </Form>
  )
}
