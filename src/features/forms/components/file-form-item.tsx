import { Controller, FieldPath } from 'react-hook-form'
import { FormItem } from '@/features/forms/components/form-item'
import { useCallback, useRef } from 'react'
import { useFileDrop } from '@/features/forms/hooks/use-file-drop'
import { cn } from '@/features/common/utils'
import { UploadIcon } from 'lucide-react'

export interface FileFormItemProps<TSchema extends Record<string, unknown>> extends Omit<FileInputProps, 'value' | 'onChange'> {
  label: string
  field: FieldPath<TSchema>
}

export function FileFormItem<TSchema extends Record<string, unknown>>({
  label,
  field,
  disabled,
  accept,
  placeholder,
}: FileFormItemProps<TSchema>) {
  return (
    <FormItem label={label} field={field} disabled={disabled}>
      <Controller
        name={field}
        render={({ field: { value, onChange } }) => (
          <FileInput value={value} onChange={onChange} accept={accept} placeholder={placeholder} disabled={disabled} />
        )}
      />
    </FormItem>
  )
}

type FileInputProps = {
  accept?: string
  placeholder?: string
  disabled?: boolean
  value?: File
  onChange: (value: File) => void
}

function FileInput({ accept, placeholder, value, disabled, onChange }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const onFilesAdded = useCallback(
    async (files: File[]) => {
      if (disabled || files.length === 0) return

      // Purposely only take 1 file
      const [file] = files
      onChange(file)
    },
    [disabled, onChange]
  )

  const { dragging, events } = useFileDrop({ onDrop: onFilesAdded })

  const handleClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [])

  return (
    <div className={cn('min-h-24 flex justify-center border rounded', dragging && 'bg-muted')} {...events} onClick={handleClick}>
      <div className={'flex flex-col items-center justify-center gap-2'}>
        {(() => {
          if (value) {
            return <span className={'text-sm'}>{value.name}</span>
          } else if (placeholder) {
            return (
              <>
                <UploadIcon />
                <span className={'text-sm'}>{placeholder}</span>
              </>
            )
          } else {
            return (
              <>
                <UploadIcon />
                <>&nbsp;</>
              </>
            )
          }
        })()}
      </div>
      <input
        ref={inputRef}
        type={'file'}
        className={'sr-only'}
        onChange={(e) => onFilesAdded(Array.from(e.target.files ?? []))}
        disabled={disabled}
        accept={accept}
      />
    </div>
  )
}
