import { Atom, useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { RenderLoadable, RenderLoadableProps } from './render-loadable'

export type RenderAsyncAtomProps<T> = Omit<RenderLoadableProps<T>, 'loadable'> & {
  atom: Atom<T>
}

export function RenderAsyncAtom<T>(props: RenderAsyncAtomProps<T>) {
  const { atom, ...rest } = props
  const converted = useAtomValue(loadable(atom))
  return <RenderLoadable loadable={converted} {...rest} />
}
