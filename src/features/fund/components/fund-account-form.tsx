import { Form } from '@/features/forms/components/form'
import { useCallback } from 'react'
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

const receiverAddressLabel = 'Receiver Address'
const amountLabel = 'Amount'

const fundFormSchema = zfd.formData({
  receiver: zfd.text().optional(),
  amount: zfd.numeric(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0)),
})

type Props = {
  onCreateReceiver?: () => Promise<Address>
  onSubmit: (receiver: Address, amount: AlgoAmount) => Promise<void>
}

export function FundAccountForm({ onCreateReceiver, onSubmit }: Props) {
  const fundAccount = useCallback(
    async (values: z.infer<typeof fundFormSchema>) => {
      const receiver = onCreateReceiver ? await onCreateReceiver() : values.receiver
      invariant(receiver, 'Receiver is required')
      await onSubmit(receiver, algos(values.amount))
      toast.success('Account funded successfully')
    },
    [onCreateReceiver, onSubmit]
  )

  return (
    <Form
      schema={fundFormSchema}
      onSubmit={fundAccount}
      defaultValues={{}}
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
            decimalScale: 5,
            thousandSeparator: true,
          })}
        </>
      )}
    </Form>
  )
}
