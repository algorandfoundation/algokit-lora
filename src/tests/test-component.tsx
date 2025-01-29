import { queries, RenderResult } from '@testing-library/react'
import userEvent, { UserEvent } from '@testing-library/user-event'
import { act } from 'react'

export async function executeComponentTest<T extends RenderResult<typeof queries, HTMLElement, HTMLElement>>(
  renderComponent: () => T,
  assertion: (component: T, user: UserEvent) => Promise<unknown>
) {
  const user = userEvent.setup()
  const myUser = myUserEvent(user)
  const component = await act(async () => renderComponent())

  await assertion(component, myUser)
}

const myUserEvent = (user: UserEvent): UserEvent => {
  return {
    ...user,
    click: (element: Element) => {
      return act(async () => {
        await user.click(element)
      })
    },
    upload: (element: HTMLElement, fileOrFiles: File | File[]) => {
      return act(async () => {
        await user.upload(element, fileOrFiles)
      })
    },
    type: (element: Element, text: string) => {
      return act(async () => {
        await user.type(element, text)
      })
    },
  }
}
