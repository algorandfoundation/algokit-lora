import SvgAlgorand from '@/features/common/components/icons/algorand'
import { Form } from '@/features/forms/components/form'
import { FormActions } from '@/features/forms/components/form-actions'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { numberSchema } from '@/features/forms/data/common'
import { algos } from '@algorandfoundation/algokit-utils'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

const amountLabel = 'Amount'

type Props = {
  onSubmit: (amount: AlgoAmount) => Promise<void>
  limit: AlgoAmount
}

export function RefundDispenserForm({ onSubmit, limit }: Props) {
  const refundDispenserAccount = useCallback(
    async (values: z.infer<typeof refundFormSchema>) => {
      await onSubmit(algos(values.amount))
      toast.success('Dispenser refunded successfully')
    },
    [onSubmit]
  )

  const refundFormSchema = useMemo(() => {
    return zfd.formData({
      amount: numberSchema(
        z
          .number({ required_error: 'Required', invalid_type_error: 'Required' })
          .min(0.1)
          .refine((value) => (limit ? value <= limit.algos : true), {
            message: `${limit ? `${limit.algos} ` : ''}ALGO limit exceeded`,
          })
      ),
    })
  }, [limit])

  return (
    <Form
      schema={refundFormSchema}
      defaultValues={{ amount: '' as unknown as undefined }}
      onSubmit={refundDispenserAccount}
      formAction={
        <FormActions>
          <SubmitButton>Refund</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <>
          {helper.numberField({
            label: (
              <span className="flex items-center gap-1.5">
                {amountLabel}
                <SvgAlgorand className="h-auto w-3" />
              </span>
            ),
            field: 'amount',
            placeholder: (1).toString(),
            helpText: limit ? <span className="flex items-center">{limit.algos}&nbsp;ALGO available</span> : undefined,
            decimalScale: 6,
            thousandSeparator: true,
          })}
        </>
      )}
    </Form>
  )
}
