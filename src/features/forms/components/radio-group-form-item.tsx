import { Controller } from 'react-hook-form'
import { FormItem, FormItemProps } from '@/features/forms/components/form-item'
import { RadioGroup, RadioGroupItem } from '@/features/common/components/radio-group'
import { Label } from '@/features/common/components/label'

type RadioOption = {
  value: string
  label: string
}
export interface RadioGroupFormItemProps<TSchema extends Record<string, unknown>> extends Omit<FormItemProps<TSchema>, 'children'> {
  options: RadioOption[]
  className?: string
}

export function RadioGroupFormItem<TSchema extends Record<string, unknown>>({
  field,
  disabled,
  options,
  className,
  ...props
}: RadioGroupFormItemProps<TSchema>) {
  return (
    <FormItem {...props} field={field} disabled={disabled} className={className} noFor={true}>
      <Controller
        name={field}
        render={({ field: { value, onChange } }) => (
          <RadioGroup id={field} onValueChange={onChange} value={value} disabled={disabled}>
            {options.map((option) => {
              const optionId = `${field}-${option.value}`
              return (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem value={option.value} id={optionId} />
                  <Label htmlFor={optionId}>{option.label}</Label>
                </div>
              )
            })}
          </RadioGroup>
        )}
      />
    </FormItem>
  )
}
