import type { DragEvent } from 'react'
import { useMemo } from 'react'
import { useToggle } from '@/features/common/hooks/use-toggle'

function preventDefaultAndStopPropagation(e: DragEvent) {
  e.stopPropagation()
  e.preventDefault()
}

export const useFileDrop = ({ onDrop }: { onDrop(e: File[]): void }) => {
  const { on, off, state: dragging } = useToggle()

  return {
    events: useMemo(() => {
      return {
        onDrop(e: DragEvent) {
          preventDefaultAndStopPropagation(e)
          off()
          if ('files' in e.dataTransfer) onDrop(Array.from(e.dataTransfer.files))
        },
        onDragEnd(e: DragEvent) {
          preventDefaultAndStopPropagation(e)
          off()
        },
        onDragOver(e: DragEvent) {
          preventDefaultAndStopPropagation(e)
          on()
        },
        onDragLeave(e: DragEvent) {
          preventDefaultAndStopPropagation(e)
          off()
        },
        onDragEnter(e: DragEvent) {
          preventDefaultAndStopPropagation(e)
          on()
        },
      }
    }, [off, on, onDrop]),
    dragging,
  }
}
