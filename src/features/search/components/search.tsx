import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@/features/common/components/command'
import { cn } from '@/features/common/utils'
import { useCallback } from 'react'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../data'
import { Loader } from 'lucide-react'
import { Badge } from '@/features/common/components/badge'
import { useLocationChange } from '@/features/common/hooks/use-location-change'

export const searchPlaceholderLabel = 'Search by ID or Address'
export const noSearchResultsMessage = 'No results.'

export function Search() {
  const navigate = useNavigate()
  const [term, setTerm, loadableResults] = useSearch()

  const handleInput = useCallback(
    (id: string) => {
      setTerm(id.trim())
    },
    [setTerm]
  )

  const handleSelection = useCallback(
    (url: string) => {
      navigate(url)
    },
    [navigate]
  )

  const clearTerm = useCallback(() => term && setTerm(''), [setTerm, term])

  useLocationChange(clearTerm)

  return (
    <Command className={cn('bg-card text-card-foreground w-80 h-auto z-20 border')} shouldFilter={false} loop>
      <CommandInput placeholder={searchPlaceholderLabel} value={term} onValueChange={handleInput} />
      <CommandList>
        <RenderLoadable
          loadable={loadableResults}
          fallback={
            <CommandLoading>
              <Loader className="mx-auto size-5 animate-spin" />
            </CommandLoading>
          }
        >
          {(results) => {
            if (!term) {
              return <></>
            }
            if (!results || results.length === 0) {
              return <CommandEmpty>{noSearchResultsMessage}</CommandEmpty>
            }
            return (
              <CommandGroup heading="Results" className={cn('border-t')}>
                {results.map((result) => {
                  return (
                    <CommandItem key={`${result.type}-${result.id}`} value={result.url} onSelect={handleSelection}>
                      <span>{result.label}</span>
                      <Badge className={cn('ml-auto')} variant="outline">
                        {result.type}
                      </Badge>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )
          }}
        </RenderLoadable>
      </CommandList>
    </Command>
  )
}
