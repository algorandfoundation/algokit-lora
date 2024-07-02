/* eslint-disable @typescript-eslint/no-explicit-any */

export type UrlParamTypeDict = Record<string, any>

export type DefaultUrlParamTypes = {
  number: number
  string: string
}

export type UrlParam<
  TParamName extends string,
  TParamType extends keyof TUrlParamTypes & string,
  TUrlParamTypes extends UrlParamTypeDict,
> = `${TParamName}:${TParamType}`

type TypeNameToType<T extends keyof TUrlParamTypes, TUrlParamTypes extends UrlParamTypeDict> = TUrlParamTypes[T]

type TypeOfParam<T, TUrlParamTypes extends UrlParamTypeDict> =
  T extends UrlParam<any, infer TType, TUrlParamTypes> ? TypeNameToType<TType, TUrlParamTypes> : never
type NameOfParam<T, TUrlParamTypes extends UrlParamTypeDict> = T extends UrlParam<infer TName, any, TUrlParamTypes> ? TName : never

type TupleKeys<T> = Exclude<keyof T, keyof any[]>
type EmptyObject = { [key in never]: never }
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

type MapParamsInternal<TKey extends keyof T, T, TUrlParamTypes extends UrlParamTypeDict> = TKey extends any
  ? { [key in NameOfParam<T[TKey], TUrlParamTypes>]: TypeOfParam<T[TKey], TUrlParamTypes> }
  : never
export type MapParams<T, TUrlParamTypes extends UrlParamTypeDict> = T extends []
  ? EmptyObject
  : UnionToIntersection<MapParamsInternal<TupleKeys<T>, T, TUrlParamTypes>>

export type AnyUrlTemplate = UrlTemplateObj<any>

type ReplaceUnknown<T> = unknown extends T ? EmptyObject : T
type Combine<TBaseArgs, TChild> =
  TChild extends UrlTemplateObj<infer TChildParams>
    ? UrlTemplateObj<TBaseArgs & ReplaceUnknown<TChildParams>> & {
        [key in keyof Omit<TChild, keyof AnyUrlTemplate>]: TChild[key] extends AnyUrlTemplate ? Combine<TBaseArgs, TChild[key]> : never
      }
    : {
        [key in keyof TChild]: TChild[key] extends AnyUrlTemplate ? Combine<TBaseArgs, TChild[key]> : never
      }

function combine<TBase, TChildren extends Record<string, UrlTemplateObj<any>>>(
  base: UrlTemplateObj<TBase>,
  children: TChildren
): Combine<TBase, TChildren> {
  return Object.fromEntries(
    Object.entries(children).map(([key, { build, toString, extend, ...rest }]) => {
      const clone = Object.create(base)
      Object.assign(clone, {
        build,
        toString,
        extend,
        ...(combine(clone, rest) as any),
      })

      return [key, clone]
    })
  ) as any
}

export interface UrlTemplateObj<TUrlParams> {
  build(arg: TUrlParams): string

  toString(): string

  extend<TChildren extends Record<string, AnyUrlTemplate>>(children: TChildren): this & Combine<TUrlParams, TChildren>
}

export type UrlTemplateType<TArgs, TUrlParamTypes extends UrlParamTypeDict> = UrlTemplateObj<MapParams<TArgs, TUrlParamTypes>>

export type UrlParamsArray<TUrlParamTypes extends UrlParamTypeDict> = UrlParam<any, any, TUrlParamTypes>[]

export function BuildTemplateFactory<TUrlParamTypes extends UrlParamTypeDict = DefaultUrlParamTypes>() {
  return function UrlTemplate<TArgs extends UrlParamsArray<TUrlParamTypes>>(
    str: TemplateStringsArray,
    ...params: TArgs
  ): UrlTemplateType<TArgs, TUrlParamTypes> {
    return {
      build(arg: MapParams<TArgs, TUrlParamTypes>) {
        const base = getBaseTemplate(this)?.build(arg) ?? ''
        return (
          base +
          str.reduce((acc, str, i) => {
            if (i >= params.length) {
              return `${acc}${str}`
            } else {
              return `${acc}${str}${(arg as any)[params[i].split(':')[0]]}`
            }
          }, '')
        )
      },
      toString() {
        const base = getBaseTemplate(this)?.toString() ?? ''
        return base + buildString(str, ...params)
      },
      extend<TChildren extends Record<string, AnyUrlTemplate>>(children: TChildren) {
        return {
          ...this,
          ...combine(this as any, children),
        }
      },
    }
  }
}

export const UrlTemplate = BuildTemplateFactory()

const getBaseTemplate = (template: UrlTemplateObj<any>): UrlTemplateObj<any> | undefined => {
  const proto = Object.getPrototypeOf(template)
  return proto === Object.getPrototypeOf({}) ? undefined : proto
}

export const splatParamName = 'splat'

function buildString<TArgs extends UrlParam<any, any, any>[]>(str: TemplateStringsArray, ...params: TArgs) {
  return str.reduce((acc, str, i) => {
    if (i >= params.length) {
      return `${acc}${str}`
    } else {
      const paramName = params[i].split(':')[0]
      return paramName !== splatParamName ? `${acc}${str}:${params[i].split(':')[0]}` : `${acc}${str}/*`
    }
  }, '')
}
