import { useNetworkConfigs, useSelectedNetwork } from '@/features/network/data'
import { Label } from '@/features/common/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/common/components/select'
import { cn } from '@/features/common/utils'
import { useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

type NetworkSelectProps = {
  showLabel?: boolean
}

export function NetworkSelect({ showLabel = true }: NetworkSelectProps) {
  const [selectedNetwork, setSelectedNetwork] = useSelectedNetwork()
  const networkConfigs = useNetworkConfigs()
  const { networkId: currentNetworkId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const handleNetworkChange = useCallback(
    (newNetworkId: string) => {
      const currentPath = location.pathname
      setSelectedNetwork(newNetworkId)
      if (currentNetworkId) {
        const newUrl = currentPath.replace(currentNetworkId, newNetworkId)
        navigate(newUrl)
      }
    },
    [currentNetworkId, location.pathname, navigate, setSelectedNetwork]
  )

  return (
    <div className={cn('flex flex-col')}>
      {showLabel && (
        <Label htmlFor="network" className={cn('ml-0.5 mb-2')}>
          Active network
        </Label>
      )}
      <Select onValueChange={handleNetworkChange} value={selectedNetwork}>
        <SelectTrigger id="network" className={cn(!showLabel && 'w-28 lg:w-40', showLabel && 'w-48')}>
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent className={cn('bg-card text-card-foreground')}>
          {Object.entries(networkConfigs).map(([id, config]) => (
            <SelectItem key={id} value={id}>
              <div className="max-w-48 truncate">{config.name}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
