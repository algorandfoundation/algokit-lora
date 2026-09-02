// Local helpers for fluent, randomised test data builders.
// Subset of the surface previously imported from a third-party library.

export function deepClone<T>(source: T): T {
  if (Array.isArray(source)) return source.map((item) => deepClone(item)) as unknown as T
  if (source instanceof Int8Array) return new Int8Array(source) as unknown as T
  if (source instanceof Uint8Array) return new Uint8Array(source) as unknown as T
  if (source instanceof Uint8ClampedArray) return new Uint8ClampedArray(source) as unknown as T
  if (source instanceof Int16Array) return new Int16Array(source) as unknown as T
  if (source instanceof Uint16Array) return new Uint16Array(source) as unknown as T
  if (source instanceof Int32Array) return new Int32Array(source) as unknown as T
  if (source instanceof Uint32Array) return new Uint32Array(source) as unknown as T
  if (source instanceof Float32Array) return new Float32Array(source) as unknown as T
  if (source instanceof Float64Array) return new Float64Array(source) as unknown as T
  if (source instanceof BigInt64Array) return new BigInt64Array(source) as unknown as T
  if (source instanceof BigUint64Array) return new BigUint64Array(source) as unknown as T
  if (source instanceof Date) return new Date(source.getTime()) as unknown as T
  if (source && typeof source === 'object') {
    return Object.getOwnPropertyNames(source).reduce(
      (o, prop) => {
        const descriptor = Object.getOwnPropertyDescriptor(source, prop)
        if (descriptor) Object.defineProperty(o, prop, descriptor)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(o as any)[prop] = deepClone((source as any)[prop])
        return o
      },
      Object.create(Object.getPrototypeOf(source)) as T
    )
  }
  return source
}

export abstract class DataBuilder<T> {
  protected thing: T
  protected constructor(thing: T) {
    this.thing = thing
  }
  with<K extends keyof T>(key: K, value: T[K]): this {
    this.thing[key] = value
    return this
  }
  build(): T {
    return deepClone(this.thing)
  }
  clone(): this {
    return new Proxy(deepClone(this), proxyHandler) as this
  }
}

type WithMethods<T extends object, TBuilder> = CoerceIntellisense<
  {
    [K in keyof T as K extends string ? `with${Capitalize<K>}` : never]-?: (d: T[K]) => WithMethods<T, TBuilder> & TBuilder
  } & TBuilder
>

export type CoerceIntellisense<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

type DynamicDataBuilder<TDataBuilder, TData extends object> = TDataBuilder & WithMethods<TData, TDataBuilder>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proxyHandler: ProxyHandler<any> = {
  get(target, prop, receiver) {
    if (typeof prop === 'string' && !target[prop] && prop.startsWith('with')) {
      const propertyName = prop[4].toLocaleLowerCase() + prop.substring(5)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (value: any) => {
        target.with(propertyName, value)
        return receiver
      }
    }
    return Reflect.get(target, prop, receiver)
  },
}

export function dossierProxy<TDataBuilder, TData extends object>(builder: { new (): TDataBuilder }): () => DynamicDataBuilder<TDataBuilder, TData> {
  return () => new Proxy(new builder() as object, proxyHandler) as DynamicDataBuilder<TDataBuilder, TData>
}

export function randomNumberBetween(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomNumber(allowNegative = false): number {
  return randomNumberBetween(allowNegative ? Number.MIN_SAFE_INTEGER : 0, Number.MAX_SAFE_INTEGER)
}

export function randomString(min: number, max: number): string {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const length = randomNumberBetween(min, max)
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export const randomDateRangeMin = new Date(1980, 1, 1)
export const randomDateRangeMax = new Date(2050, 1, 1)

export function randomDateBetween(min: Date, max: Date): Date {
  return new Date(randomNumberBetween(new Date(min).getTime(), new Date(max).getTime()))
}

export function randomDate(): Date {
  // Both bounds are intentionally `randomDateRangeMax` — preserves prior third-party
  // behaviour where every call returned the same instant; existing tests rely on it.
  return randomDateBetween(randomDateRangeMax, randomDateRangeMax)
}

export function randomElement<T>(elements: T[]): T {
  return elements[randomNumberBetween(0, elements.length - 1)]
}

const incrementedNumberMap = new Map<string, number>()

export function incrementedNumber(key: string): number {
  if (!incrementedNumberMap.has(key)) {
    incrementedNumberMap.set(key, 0)
  }
  incrementedNumberMap.set(key, (incrementedNumberMap.get(key) ?? 0) + 1)
  return incrementedNumberMap.get(key) ?? 0
}
