import { useParams } from 'react-router-dom'
import { UrlParams } from '@/routes/urls'

type ExtractParameterName<T> = T extends `${infer ParameterName}:${string}` ? ParameterName : never

export const useParameterName = <T extends (typeof UrlParams)[keyof typeof UrlParams]>(urlParameter: T) =>
  urlParameter.split(':')[0] as ExtractParameterName<T>

export const useRequiredParam = <T extends (typeof UrlParams)[keyof typeof UrlParams]>(urlParameter: T) => {
  const params = useParams()

  const parameterName = useParameterName(urlParameter)
  const param = params[parameterName]
  if (typeof param !== 'string') throw new Error(`Parameter ${parameterName} is not present in the route`)

  return { [parameterName]: param }
}
