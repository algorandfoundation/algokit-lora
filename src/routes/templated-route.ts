import type { IndexRouteObject, NonIndexRouteObject } from 'react-router/dist/lib/context'
import { AnyUrlTemplate } from './url-template'
import { RouteObject } from 'react-router-dom'

export type TemplatedRoute =
  | (Omit<IndexRouteObject, 'path' | 'handle'> & {
      template?: AnyUrlTemplate
    })
  | (Omit<NonIndexRouteObject, 'path' | 'children' | 'handle'> & {
      template?: AnyUrlTemplate
      children?: TemplatedRoute[]
    })

export const evalTemplates = (templatedRoutes: TemplatedRoute[]): RouteObject[] =>
  templatedRoutes.map(({ template, index, children, ...r }) => {
    return index
      ? {
          ...r,
          index,
          path: template?.toString(),
        }
      : {
          ...r,
          index,
          path: template?.toString(),
          children: children && evalTemplates(children),
        }
  })
