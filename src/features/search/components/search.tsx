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
import { useCallback, useEffect, useRef } from 'react'
import { RenderLoadable } from '@/features/common/components/render-loadable'
import { useNavigate, NavLink } from 'react-router-dom'
import { useSearch } from '../data'
import { Loader2 as Loader } from 'lucide-react'
import { useLocationChange } from '@/features/common/hooks/use-location-change'
import { isMacOs } from '@/utils/is-mac-platform'

export const searchPlaceholderLabel = `Search by ID or Address ${isMacOs ? '(⌘K)' : '(Ctrl+K)'}`
export const noSearchResultsMessage = 'No results.'

type Props = {
  className?: string
}

export function Search({ className }: Props) {
  const navigate = useNavigate()
  const [term, setTerm, loadableResults] = useSearch()
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setTerm('')
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setTerm])

  return (
    <Command
      className={cn('bg-popover text-popover-foreground w-88 h-auto z-20 border border-input mt-[1.2rem]', term && 'shadow-md', className)}
      label="Search by ID or Address"
      shouldFilter={false}
      loop
    >
      <CommandInput
        placeholder={searchPlaceholderLabel}
        value={term}
        onValueChange={handleInput}
        ref={searchInputRef}
        onSearchClear={clearTerm}
      />
      <CommandList>
        {term && (
          <RenderLoadable
            loadable={loadableResults}
            fallback={
              <CommandLoading>
                <Loader className="mx-auto size-5 animate-spin" />
              </CommandLoading>
            }
          >
            {(results) => {
              if (!results || results.length === 0) {
                return <CommandEmpty>{noSearchResultsMessage}</CommandEmpty>
              }
              return (
                <CommandGroup heading="Results" className={cn('border-t border-input')}>
                  {results.map((result) => {
                    return (
                      <CommandItem key={`${result.type}-${result.id}`} value={result.url} onSelect={handleSelection}>
                        <NavLink className="text-primary truncate underline" to={result.url}>
                          {result.label}
                        </NavLink>
                        <span className={cn('ml-auto text-xs')}>{result.type}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )
            }}
          </RenderLoadable>
        )}
      </CommandList>
    </Command>
  )
}
