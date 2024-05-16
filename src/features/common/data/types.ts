import { useStore } from 'jotai'

export type JotaiStore = ReturnType<typeof useStore>

export type NoStringIndex<T> = { [K in keyof T as string extends K ? never : K]: T[K] }
