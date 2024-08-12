import { Ellipsis } from 'lucide-react'
import { RenderLoadable, RenderLoadableProps } from './render-loadable'

export function RenderInlineLoadable<T>(props: RenderLoadableProps<T>) {
  const { fallback, ...rest } = props
  return <RenderLoadable fallback={fallback ?? <Ellipsis className="size-4 h-full animate-pulse" />} {...rest} />
}
