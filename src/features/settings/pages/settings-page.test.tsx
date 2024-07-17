import { describe, it } from 'vitest'
import { executeComponentTest } from '@/tests/test-component'
import { render } from '@/tests/testing-library'
import { SettingsPage } from '@/features/settings/pages/settings-page'
import { tableAssertion } from '@/tests/assertions/table-assertion'
import { networkConfigsTableLabel } from '@/features/settings/components/networks-configs-table'

describe('when viewing settings page', () => {
  it('the network table should be visible', () => {
    return executeComponentTest(
      () => render(<SettingsPage />),
      async (component) => {
        const networkConfigsTable = await component.findByRole('table', { name: networkConfigsTableLabel })
        tableAssertion({
          container: networkConfigsTable,
          rows: [
            { cells: ['LocalNet', 'http://localhost:4001', 'http://localhost:8980'] },
            { cells: ['TestNet', 'https://testnet-api.algonode.cloud:443', 'https://testnet-idx.algonode.cloud:443'] },
            { cells: ['MainNet', 'https://mainnet-api.algonode.cloud:443', 'https://mainnet-idx.algonode.cloud:443'] },
          ],
          matchRowCount: true,
        })
      }
    )
  })
})
