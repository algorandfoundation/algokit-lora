import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AppSpec, Arc32AppSpec, Arc4AppSpec } from '../app-interfaces/data/types'
import { Arc56Contract } from '@algorandfoundation/algokit-utils/types/app-arc56'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isArc32AppSpec(appSpec: AppSpec): appSpec is Arc32AppSpec {
  return (
    appSpec !== null &&
    typeof appSpec === 'object' &&
    'source' in appSpec &&
    'contract' in appSpec &&
    'schema' in appSpec &&
    'state' in appSpec
  )
}

export function isArc4AppSpec(appSpec: AppSpec): appSpec is Arc4AppSpec {
  return (
    appSpec !== null &&
    typeof appSpec === 'object' &&
    !('arcs' in appSpec) &&
    'methods' in appSpec &&
    Array.isArray(appSpec.methods) &&
    appSpec.methods.length > 0 &&
    typeof appSpec.methods[0] === 'object'
  )
}

export function isArc56AppSpec(appSpec: AppSpec): appSpec is Arc56Contract {
  return (
    appSpec !== null &&
    typeof appSpec === 'object' &&
    'arcs' in appSpec &&
    'methods' in appSpec &&
    Array.isArray(appSpec.methods) &&
    appSpec.methods.length > 0 &&
    typeof appSpec.methods[0] === 'object'
  )
}
