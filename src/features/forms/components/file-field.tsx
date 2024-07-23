import { cn } from '@/features/common/utils'
import { useFileDrop } from '../hooks/use-file-drop'
import { useCallback, useState } from 'react'
import { UploadIcon } from 'lucide-react'

type Props = {
  className?: string
  accept?: string
  placeholder?: string
  disabled?: boolean
  uploading?: boolean
  value?: File
  onChange: (value: File) => void
}

// TODO: reconsider the name and location
export function FileField({ className, accept, placeholder, value, disabled, uploading, onChange }: Props) {
  const [error, setError] = useState<string | undefined>()
  const onFilesAdded = useCallback(
    async (files: File[]) => {
      if (disabled || files.length === 0) return
      if (files.length > 1) {
        setError('Please only select one file')
        return
      }

      const [file] = files
      if (accept?.split(',').includes(file.type) === false) {
        const fileTypes = accept
          .split(',')
          .map((str) => str.trim())
          .join(', ')
        setError(`Only ${fileTypes} file types are allowed`)
        return
      }

      onChange(file)
    },
    [accept, disabled, onChange]
  )

  const { dragging, events } = useFileDrop({ onDrop: onFilesAdded })

  return (
    <>
      {error && <div className="text-error">{error}</div>}
      <div className={cn('min-h-24 flex justify-center', className, dragging && '')} {...events}>
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
          type={'file'}
          className={'sr-only'}
          onChange={(e) => onFilesAdded(Array.from(e.target.files ?? []))}
          disabled={disabled || uploading}
          accept={accept}
        />
      </div>
    </>
  )
}
