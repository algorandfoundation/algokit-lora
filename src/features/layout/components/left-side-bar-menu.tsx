import { TemplatedNavLink } from '../../routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/features/common/components/navigation-menu'
import { cn } from '@/features/common/utils'
import { Button } from '@/features/common/components/button'
import { useCallback } from 'react'
import { useLayout, useSelectedNetwork } from '@/features/settings/data'
import { Telescope, Braces, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { ThemeToggle } from '@/features/settings/components/theme-toggle'

type Props = {
  className?: string
}

export function LeftSideBarMenu({ className }: Props) {
  const [selectedNetwork] = useSelectedNetwork()

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

  return (
    <NavigationMenu
      className={cn('bg-card border-r transition-all duration-300 min-h-screen', className, layout.isLeftSideBarExpanded ? 'w-52' : 'w-12')}
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
                urlParams={{ networkId: selectedNetwork }}
                className={cn('[&.active]:text-primary flex items-center p-2 gap-2 min-h-10 pl-3 whitespace-nowrap')}
              >
                <div className={cn('text-primary')}>{menuItem.icon}</div>
                <div className={cn(layout.isLeftSideBarExpanded ? 'visible delay-100' : 'invisible delay-100')}>{menuItem.text}</div>
              </TemplatedNavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        <ThemeToggle />
      </NavigationMenuList>
    </NavigationMenu>
  )
}
