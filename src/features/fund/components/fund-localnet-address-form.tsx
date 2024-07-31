import { Form } from '@/features/forms/components/form'
import { useCallback } from 'react'
import { SubmitButton } from '@/features/forms/components/submit-button'
import { FormActions } from '@/features/forms/components/form-actions'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { ZERO_ADDRESS } from '@/features/common/constants'
import { zfd } from 'zod-form-data'
import { algos, getLocalNetDispenserAccount, transferAlgos } from '@algorandfoundation/algokit-utils'
import { algod, kmd } from '@/features/common/data/algo-client'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'

const addressLabel = 'Address'
const amountLabel = 'Amount'

const fundFormSchema = zfd.formData({
  address: zfd.text(),
  amount: zfd.numeric(z.number({ required_error: 'Required', invalid_type_error: 'Required' }).min(0).max(65535)),
})

// TODO: NC - Move this elsewhere
export const fundLocalnetAccount = async (address: string, amount: AlgoAmount) => {
  // TODO: NC - Fix up these deprecations
  const from = await getLocalNetDispenserAccount(algod, kmd)
  await transferAlgos(
    {
      from,
      to: address,
      amount,
      note: 'Funded by AlgoKit lora',
    },
    algod
  )
}

// TODO: NC - Clear fields on success?
// TODO: NC - Amount needs to support decimals
// TODO: NC - Put algo logo next to amount field

export function FundLocalnetAddressForm() {
  const fundAccount = useCallback(async (values: z.infer<typeof fundFormSchema>) => {
    fundLocalnetAccount(values.address, algos(values.amount))
    toast.success(`${values.address} has been funded with ${values.amount} ALGO`)
  }, [])

  return (
    <Form
      schema={fundFormSchema}
      onSubmit={fundAccount}
      formAction={
        <FormActions>
          <SubmitButton className="w-28">Fund</SubmitButton>
        </FormActions>
      }
    >
      {(helper) => (
        <>
          {helper.textField({
            label: addressLabel,
            field: 'address',
            placeholder: ZERO_ADDRESS,
          })}
          {helper.numberField({
            label: amountLabel,
            field: 'amount',
            placeholder: (1).toString(),
          })}
        </>
      )}
    </Form>
  )
}
