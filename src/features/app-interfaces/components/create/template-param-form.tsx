/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormFieldHelper } from '@/features/forms/components/form-field-helper'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { TemplateParamType } from '../../data/types'
import { Label } from '@/features/common/components/label'
import { cn } from '@/features/common/utils'

type TemplateParamFormProps = {
  formHelper: FormFieldHelper<any>
  name: string
  path: string
  disabled?: boolean
}

export function TemplateParamForm({ name, path, formHelper, disabled }: TemplateParamFormProps) {
  const { watch } = useFormContext()

  const type = watch(`${path}.type`)
  const helpText = useMemo(() => {
    switch (type) {
      case TemplateParamType.String:
        return 'A string value'
      case TemplateParamType.Number:
        return 'A number value'
      case TemplateParamType.Uint8Array:
        return 'A Base64 encoded Uint8Array value'
    }
  }, [type])

  return (
    <div className="space-y-2">
      <Label>{name}</Label>
      <div className={cn('grid gap-2 grid-cols-[200px_1fr]')}>
        {formHelper.selectField({
          field: `${path}.type`,
          label: 'Type',
          className: 'content-start',
          disabled: disabled,
          options: [
            { value: TemplateParamType.String, label: 'String' },
            { value: TemplateParamType.Number, label: 'Number' },
            { value: TemplateParamType.Uint8Array, label: 'Uint8Array' },
          ],
        })}
        {formHelper.textField({
          field: `${path}.value`,
          label: 'Value',
          className: 'content-start',
          disabled: disabled,
          helpText: helpText,
        })}
      </div>
    </div>
  )
}
