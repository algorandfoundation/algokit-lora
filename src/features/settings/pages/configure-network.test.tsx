import { describe, expect, it } from 'vitest'
import { executeComponentTest } from '@/tests/test-component'
import { render } from '@/tests/testing-library'
import { SettingsPage } from '@/features/settings/pages/settings-page'
import { createNetworkConfigDialogLabel, networkConfigsTableLabel } from '@/features/settings/components/networks-configs-table'
import { tableAssertion } from '@/tests/assertions/table-assertion'
import { findByRole, waitFor } from '@testing-library/react'

describe('when configuring networks', () => {
  describe('when creating a new network', () => {
    it('should work', () => {
      return executeComponentTest(
        () => render(<SettingsPage />),
        async (component, user) => {
          const createNetworkConfigButton = await component.findByRole('button', { name: 'Create' })

          await user.click(createNetworkConfigButton)
          const createNetworkConfigDialog = await component.findByRole('dialog', { name: createNetworkConfigDialogLabel })

          await user.type(await findByRole(createNetworkConfigDialog, 'textbox', { name: 'name' }), 'My LocalNet')
          await user.type(await findByRole(createNetworkConfigDialog, 'textbox', { name: 'indexer.server' }), 'http://localhost')
          await user.type(await findByRole(createNetworkConfigDialog, 'textbox', { name: 'indexer.port' }), '4000')
          await user.type(await findByRole(createNetworkConfigDialog, 'textbox', { name: 'algod.server' }), 'http://localhost')
          await user.type(await findByRole(createNetworkConfigDialog, 'textbox', { name: 'algod.port' }), '4001')

          await user.click(await findByRole(createNetworkConfigDialog, 'button', { name: 'Save' }))

          await waitFor(() => {
            const dialog = component.queryByRole('dialog', { name: createNetworkConfigDialogLabel })
            expect(dialog).toBeFalsy()
          })

          const networkConfigsTable = await component.findByRole('table', { name: networkConfigsTableLabel })
          tableAssertion({
            container: networkConfigsTable,
            rows: [
              { cells: ['LocalNet', 'http://localhost:4001', 'http://localhost:8980'] },
              { cells: ['TestNet', 'https://testnet-api.algonode.cloud:443', 'https://testnet-idx.algonode.cloud:443'] },
              { cells: ['MainNet', 'https://mainnet-api.algonode.cloud:443', 'https://mainnet-idx.algonode.cloud:443'] },
              { cells: ['My LocalNet', 'http://localhost:4001', 'http://localhost:4000'] },
            ],
            matchRowCount: true,
          })
        }
      )
    })
  })
})
