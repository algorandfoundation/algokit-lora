import { describe, expect, it, vi } from 'vitest'
import { getByRole, render, waitFor } from '../../../tests/testing-library'
import { ApplicationProgram, base64ProgramTabLabel, tealProgramTabLabel } from './application-program'
import { executeComponentTest } from '@/tests/test-component'
import { algod } from '@/features/common/data/algo-client'

vi.mock('@/features/common/data/algo-client', async () => {
  const original = await vi.importActual('@/features/common/data/algo-client')
  return {
    ...original,
    algod: {
      disassemble: vi.fn().mockReturnValue({
        do: vi.fn(),
      }),
    },
  }
})

describe('application-program', () => {
  describe('when rendering an application program', () => {
    const tabListName = 'test'
    const program = 'CIEBQw=='
    const teal = '\n#pragma version 8\nint 1\nreturn\n'

    it('should be rendered with the correct data', () => {
      vi.mocked(algod.disassemble('').do).mockImplementation(() => Promise.resolve({ result: teal }))

      return executeComponentTest(
        () => {
          return render(<ApplicationProgram tabsListAriaLabel={tabListName} base64Program={program} />)
        },
        async (component, user) => {
          const tabList = component.getByRole('tablist', { name: tabListName })
          expect(tabList).toBeTruthy()
          expect(tabList.children.length).toBe(2)

          const base64Tab = component.getByRole('tabpanel', { name: base64ProgramTabLabel })
          expect(base64Tab.getAttribute('data-state'), 'Base64 tab should be active').toBe('active')
          expect(base64Tab.textContent).toBe(program)

          await user.click(getByRole(tabList, 'tab', { name: tealProgramTabLabel }))
          const tealTab = component.getByRole('tabpanel', { name: tealProgramTabLabel })
          await waitFor(() => expect(tealTab.getAttribute('data-state'), 'Teal tab should be active').toBe('active'))
          expect(tealTab.textContent).toBe(teal)
        }
      )
    })
  })
})
