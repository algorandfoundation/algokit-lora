import { Atom, useStore } from 'jotai'

export type JotaiStore = ReturnType<typeof useStore>

export type AsyncMaybeAtom<T> = Atom<Promise<T> | T>

export type NoStringIndex<T> = { [K in keyof T as string extends K ? never : K]: T[K] }
