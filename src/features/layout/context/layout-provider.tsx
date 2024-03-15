import { createContext, useState } from 'react'

type LayoutProviderProps = {
  children: React.ReactNode
}

type LayoutProviderState = {
  isLeftSideBarExpanded: boolean
  setIsLeftSideBarExpanded: (expanded: boolean) => void
}

const initialState: LayoutProviderState = {
  isLeftSideBarExpanded: true,
  setIsLeftSideBarExpanded: () => null,
}

export const LayoutProviderContext = createContext<LayoutProviderState>(initialState)

export function LayoutProvider({ children, ...props }: LayoutProviderProps) {
  const leftSideBarExpandedKey = 'layout-config-left-side-bar-expanded'

  const [isLeftSideBarExpanded, setIsLeftSideBarExpanded] = useState<boolean>(
    () => localStorage.getItem(leftSideBarExpandedKey) === 'true' || true
  )

  const value = {
    isLeftSideBarExpanded,
    setIsLeftSideBarExpanded: (expanded: boolean) => {
      localStorage.setItem(leftSideBarExpandedKey, `${expanded}`)
      setIsLeftSideBarExpanded(expanded)
    },
  }

  return (
    <LayoutProviderContext.Provider {...props} value={value}>
      {children}
    </LayoutProviderContext.Provider>
  )
}
