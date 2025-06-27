import { invariant } from './utils/invariant'

// See import.meta.env definition in vite-env.d.ts
const dispenserAuth0Domain = import.meta.env.VITE_DISPENSER_AUTH0_DOMAIN
const dispenserAuth0ClientId = import.meta.env.VITE_DISPENSER_AUTH0_CLIENT_ID
const dispenserAuth0Audience = import.meta.env.VITE_DISPENSER_AUTH0_AUDIENCE
const testNetDispenserApiUrl = import.meta.env.VITE_TESTNET_DISPENSER_API_URL
const testNetDispenserAddress = import.meta.env.VITE_TESTNET_DISPENSER_ADDRESS

// Version configuration - injected at build time via vite's define feature
declare global {
  const __APP_VERSION__: string
  const __BUILD_DATE__: string
  const __COMMIT_HASH__: string
  const __ENVIRONMENT__: string
}

const appVersion = __APP_VERSION__
const buildDate = __BUILD_DATE__
const commitHash = __COMMIT_HASH__
const environment = __ENVIRONMENT__

invariant(dispenserAuth0Domain, 'dispenserAuth0Domain is not set')
invariant(dispenserAuth0ClientId, 'dispenserAuth0ClientId is not set')
invariant(dispenserAuth0Audience, 'dispenserAuth0Audience is not set')
invariant(testNetDispenserApiUrl, 'testNetDispenserApiUrl is not set')
invariant(testNetDispenserAddress, 'testNetDispenserAddress is not set')

const config = {
  dispenserAuth0Domain,
  dispenserAuth0ClientId,
  dispenserAuth0Audience,
  testNetDispenserApiUrl,
  testNetDispenserAddress,
  // Version information
  version: {
    app: appVersion,
    build: buildDate,
    commit: commitHash,
    environment: environment as 'development' | 'staging' | 'production',
  },
}

export default config
