import { useNetworkConfigs, useSelectedNetwork } from '@/features/network/data'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { cn } from '@/features/common/utils'
import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Urls } from '@/routes/urls'

const settingsUrl = Urls.Settings.build({})

export function NetworkSelect() {
  const [selectedNetwork, setSelectedNetwork] = useSelectedNetwork()
  const networkConfigs = useNetworkConfigs()
  const navigate = useNavigate()
  const location = useLocation()

  const handleNetworkChange = useCallback(
    async (value: string) => {
      if (location.pathname !== settingsUrl) {
        navigate(settingsUrl)
      }
      await setSelectedNetwork(value)
    },
    [location.pathname, navigate, setSelectedNetwork]
  )

  return (
    <div className={cn('flex w-48 flex-col')}>
      <Label htmlFor="network" className={cn('ml-0.5 mb-2')}>
        Active network
      </Label>
      <Select onValueChange={handleNetworkChange} value={selectedNetwork}>
        <SelectTrigger id="network">
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent className={cn('bg-card text-card-foreground')}>
          {Object.entries(networkConfigs).map(([id, config]) => (
            <SelectItem key={id} value={id}>
              {config.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
