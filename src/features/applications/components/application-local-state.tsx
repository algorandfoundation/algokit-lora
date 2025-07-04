import { useCallback } from 'react'
import { ApplicationStateTable } from './application-state-table'
import { useApplicationLocalStateSearch } from '../data/application-local-state'
import { Application } from '../models'
import { XIcon } from 'lucide-react'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Button } from '@/features/common/components/button'
import { enterAddressToViewLocalStateMessage } from './labels'

type Props = {
  application: Application
}

export function ApplicationLocalState({ application }: Props) {
  const [address, setAddress, loadableResults] = useApplicationLocalStateSearch(application.id)

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAddress(e.target.value.trim())
    },
    [setAddress]
  )

  const handleClear = useCallback(() => address && setAddress(''), [setAddress, address])

  const data = address
    ? loadableResults
    : ({ state: 'hasError', error: new Error(enterAddressToViewLocalStateMessage) } satisfies typeof loadableResults)

  return (
    <div className="space-y-4 overflow-hidden">
      <div className="max-w-[35rem] rounded-md border border-input bg-popover text-popover-foreground">
        <div className="flex items-center px-3">
          <MagnifyingGlassIcon className="mr-2 size-4 shrink-0 opacity-50" />
          <input
            placeholder="Search by Address or NFD"
            type="text"
            aria-label="local-state-address"
            id="local-state-address"
            value={address}
            onChange={handleInput}
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            onClick={handleClear}
            variant="no-style"
            size="icon"
            aria-label="Clear local state address search"
            className="size-4 text-muted-foreground"
          >
            <XIcon />
          </Button>
        </div>
      </div>
      <ApplicationStateTable data={data} />
    </div>
  )
}
