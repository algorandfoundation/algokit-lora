import { TemplatedNavLink } from '../../routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '../../../routes/urls'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/features/common/components/navigation-menu'
import { cn } from '@/features/common/utils'
import { Button } from '@/features/common/components/button'
import { useCallback, useMemo } from 'react'
import { useLayout } from '@/features/settings/data'
import { useLocation } from 'react-router-dom'
import { Telescope, Braces, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

type Props = {
  className?: string
}

export function LeftSideBarMenu({ className }: Props) {
  const menuItems = [
    { urlTemplate: Urls.Explore, icon: <Telescope />, text: 'Explore' },
    { urlTemplate: Urls.AppStudio, icon: <Braces />, text: 'App Studio' },
    { urlTemplate: Urls.Settings, icon: <Settings />, text: 'Settings' },
  ]
  const [layout, setLayout] = useLayout()

  const toggleLeftSideBar = useCallback(
    () => setLayout((prev) => ({ ...prev, isLeftSideBarExpanded: !prev.isLeftSideBarExpanded })),
    [setLayout]
  )

  // The little hack to make the index (root) menu item active when transaction, block, account, asset, application are viewed
  // This needs to be done because React router doesn't match the root URL with any sub-path
  // The doc: https://reactrouter.com/en/main/components/nav-link#end
  const location = useLocation()
  const isIndexActive = useMemo(() => {
    const forceMatchWithIndex = [
      Urls.Transaction.build({}),
      Urls.Block.build({}),
      Urls.Account.build({}),
      Urls.Asset.build({}),
      Urls.Application.build({}),
    ]
    return forceMatchWithIndex.some((path) => location.pathname.startsWith(path))
  }, [location.pathname])

  return (
    <NavigationMenu
      className={cn('bg-card transition-all duration-300 min-h-screen', className, layout.isLeftSideBarExpanded ? 'w-52' : 'w-12')}
    >
      <NavigationMenuList className={cn('flex-col items-start')}>
        <NavigationMenuItem className={cn('flex justify-end')}>
          <Button variant="ghost" size="icon" onClick={toggleLeftSideBar}>
            {layout.isLeftSideBarExpanded ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
        </NavigationMenuItem>
        {menuItems.map((menuItem, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink asChild>
              <TemplatedNavLink
                urlTemplate={menuItem.urlTemplate}
                className={cn(
                  '[&.active]:text-primary flex items-center p-2 gap-2 min-h-10 pl-3 whitespace-nowrap',
                  menuItem.urlTemplate === Urls.Explore && isIndexActive ? 'active' : ''
                )}
              >
                <div className={cn(isIndexActive && 'text-primary')}>{menuItem.icon}</div>
                <div className={cn(layout.isLeftSideBarExpanded ? 'visible delay-100' : 'invisible delay-100')}>{menuItem.text}</div>
              </TemplatedNavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
