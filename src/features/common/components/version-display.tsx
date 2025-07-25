import { useVersion } from '../hooks/use-version'
import { Badge } from './badge'
import { cn } from '../utils'

interface VersionDisplayProps {
  className?: string
  showDetails?: boolean
  showEnvironment?: boolean
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({ className, showDetails = false, showEnvironment = true }) => {
  const { version, environment, buildDate, commitHash, isTauri } = useVersion()

  const getEnvironmentVariant = () => {
    switch (environment) {
      case 'staging':
        return 'secondary' as const
      case 'production':
        return 'default' as const
      default:
        return 'outline' as const
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="font-mono text-sm">v{version}</span>
      {showEnvironment && (
        <>
          <Badge variant={getEnvironmentVariant()}>{environment}</Badge>
          {isTauri && <Badge variant="outline">Desktop</Badge>}
        </>
      )}
      {showDetails && (
        <div className="text-xs text-muted-foreground">
          <div>Built: {new Date(buildDate).toLocaleDateString()}</div>
          <div>Commit: {commitHash.substring(0, 7)}</div>
        </div>
      )}
    </div>
  )
}
