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
    // todo: check if it's a valid transaction id
    navigate(Urls.Explore.Transaction.ById.build({ transactionId: searchQuery }))
    setSearchQuery('')
  }, [navigate, searchQuery])

  return (
    <div className={cn('flex gap-2')}>
      <Input className={cn('w-96')} placeholder="Search" value={searchQuery} onChange={handleInput} />
      <Button onClick={doSearch}>search</Button>
    </div>
  )
}
