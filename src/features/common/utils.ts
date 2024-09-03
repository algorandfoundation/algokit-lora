import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Arc32AppSpec, Arc4AppSpec } from '../app-interfaces/data/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isArc32AppSpec(appSpec: Arc32AppSpec | Arc4AppSpec): appSpec is Arc32AppSpec {
  return (
    appSpec !== null &&
    typeof appSpec === 'object' &&
    'source' in appSpec &&
    'contract' in appSpec &&
    'schema' in appSpec &&
    'state' in appSpec
  )
}

export function isArc4AppSpec(appSpec: Arc32AppSpec | Arc4AppSpec): appSpec is Arc4AppSpec {
  return (
    appSpec !== null &&
    typeof appSpec === 'object' &&
    'methods' in appSpec &&
    Array.isArray(appSpec.methods) &&
    appSpec.methods.length > 0 &&
    typeof appSpec.methods[0] === 'object'
  )
}
