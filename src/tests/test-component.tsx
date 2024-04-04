import userEvent, { UserEvent } from '@testing-library/user-event'

export async function executeComponentTest<T>(renderComponent: () => T, assertion: (component: T, user: UserEvent) => Promise<unknown>) {
  const component = renderComponent()
  const user = userEvent.setup()

  await assertion(component, user)
}
