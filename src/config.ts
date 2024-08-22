import { invariant } from './utils/invariant'

// See import.meta.env definition in vite-env.d.ts
const dispenserAuth0Domain = import.meta.env.VITE_DISPENSER_AUTH0_DOMAIN
const dispenserAuth0ClientId = import.meta.env.VITE_DISPENSER_AUTH0_CLIENT_ID
const dispenserAuth0Audience = import.meta.env.VITE_DISPENSER_AUTH0_AUDIENCE
const testNetDispenserApiUrl = import.meta.env.VITE_TESTNET_DISPENSER_API_URL
const testNetDispenserAddress = import.meta.env.VITE_TESTNET_DISPENSER_ADDRESS

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
}

export default config
