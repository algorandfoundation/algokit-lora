import { Ellipsis } from 'lucide-react'
import { RenderLoadable, RenderLoadableProps } from './render-loadable'

export function RenderInlineLoadable<T>(props: Omit<RenderLoadableProps<T>, 'fallback'>) {
  return <RenderLoadable fallback={<Ellipsis className="size-4 h-full animate-pulse" />} {...props} />
}
