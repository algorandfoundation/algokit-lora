import config from '@/config'

interface VersionInfo {
  version: string
  buildDate: string
  commitHash: string
  environment: 'development' | 'staging' | 'production'
}

export const useVersion = (): VersionInfo => {
  return {
    version: config.version.app,
    buildDate: config.version.build,
    commitHash: config.version.commit,
    environment: config.version.environment,
  }
}