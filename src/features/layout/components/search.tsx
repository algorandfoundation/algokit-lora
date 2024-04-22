import { Button } from '@/features/common/components/button'
import { Input } from '@/features/common/components/input'
import { cn } from '@/features/common/utils'
import { Urls } from '@/routes/urls'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function Search() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const navigate = useNavigate()

  const handleInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }, [])

  const doSearch = useCallback(() => {
    if (!searchQuery) {
      return
    }
    navigate(Urls.Explore.Transaction.ById.build({ transactionId: searchQuery }))
    setSearchQuery('')
  }, [navigate, searchQuery])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        doSearch()
      }
    },
    [doSearch]
  )

  return (
    <div className={cn('flex gap-2 flex-grow justify-end')}>
      <Input className={cn('max-w-96')} placeholder="Search" value={searchQuery} onChange={handleInput} onKeyDown={handleKeyDown} />
      <Button onClick={doSearch}>Search</Button>
    </div>
  )
}
