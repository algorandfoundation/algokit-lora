/* eslint-disable @typescript-eslint/no-explicit-any */
export type ValueFromPropertyPath<TObject, TProperty> = TProperty extends keyof TObject
  ? TObject[TProperty]
  : TProperty extends `${infer TFirst}.${infer TRest}`
    ? TFirst extends keyof TObject
      ? ValueFromPropertyPath<TObject[TFirst], TRest>
      : never
    : never

export type JoinPaths<K, P> = K extends string | number ? (P extends string | number ? `${K}${'' extends P ? '' : '.'}${P}` : never) : never
export type DefaultOpaqueTypes = Date | Array<any>
/**
 * Returns true if T exists in TUnionOfTypes.
 *
 * Ensures that types are only considered equal if A is assignable to B AND B is assignable to A
 */
type ContainsType<T, TUnionOfTypes> = true extends (
  TUnionOfTypes extends any ? ([T, TUnionOfTypes] extends [TUnionOfTypes, T] ? true : false) : never
)
  ? true
  : false
export type PropertyPaths<T, TOpaque = DefaultOpaqueTypes, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
    ? ContainsType<T, TOpaque> extends true
      ? ''
      : {
          [K in keyof T]-?: K extends string | number
            ? `${K}` | (PropertyPaths<T[K], TOpaque, Prev[D]> extends infer R ? JoinPaths<K, R> : never)
            : never
        }[keyof T]
    : ''
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

export const getPropertyPath = <TObject, TProperty extends PropertyPaths<TObject>>(
  obj: TObject,
  path: TProperty
): ValueFromPropertyPath<TObject, TProperty> =>
  path.split('.').reduce((acc, cur) => (acc as any)[cur], obj) as ValueFromPropertyPath<TObject, TProperty>
