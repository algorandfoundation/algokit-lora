import { Ellipsis } from 'lucide-react'
import { RenderAsyncAtom, RenderAsyncAtomProps } from './render-async-atom'

const transformError = (error: Error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to load async data', error)
  return undefined
}

export function RenderInlineAsyncAtom<T>(props: Omit<RenderAsyncAtomProps<T>, 'fallback'>) {
  return <RenderAsyncAtom transformError={transformError} fallback={<Ellipsis className="size-4 h-full animate-pulse" />} {...props} />
}
