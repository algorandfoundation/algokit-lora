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

const navIconClassName = cn('border rounded-md p-2 ml-1')

export function LeftSideBarMenu({ className }: Props) {
  const [selectedNetwork] = useSelectedNetwork()

  const menuItems = [
    { urlTemplate: Urls.Explore, icon: <Telescope />, text: 'Explore' },
    { urlTemplate: Urls.AppStudio, icon: <Braces />, text: 'App Studio' },
  ]
  const [layout, setLayout] = useLayout()

  const toggleLeftSideBar = useCallback(
    () => setLayout((prev) => ({ ...prev, isLeftSideBarExpanded: !prev.isLeftSideBarExpanded })),
    [setLayout]
  )

  const navLinkClassName = cn(
    layout.isLeftSideBarExpanded && 'mr-2',
    !layout.isLeftSideBarExpanded && 'mr-1',
    '[&.active]:border-border [&.active]:bg-accent [&.active]:text-primary border border-card rounded-r-md p-1 gap-2 flex items-center whitespace-nowrap'
  )

  const navTextClassName = cn(layout.isLeftSideBarExpanded ? 'visible delay-100' : 'invisible w-0 delay-100')

  return (
    <aside
      className={cn(
        'flex flex-col bg-card border-r transition-all duration-300',
        className,
        layout.isLeftSideBarExpanded ? 'w-56' : 'w-[3.8rem]'
      )}
    >
      <Button className="ml-auto size-9 text-muted-foreground" variant="no-style" size="icon" onClick={toggleLeftSideBar}>
        {layout.isLeftSideBarExpanded ? <PanelLeftClose /> : <PanelLeftOpen />}
      </Button>
      <NavigationMenu>
        <NavigationMenuList>
          {menuItems.map((menuItem, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink asChild>
                <TemplatedNavLink
                  urlTemplate={menuItem.urlTemplate}
                  urlParams={{ networkId: selectedNetwork }}
                  className={navLinkClassName}
                >
                  <div className={navIconClassName}>{menuItem.icon}</div>
                  <span className={navTextClassName}>{menuItem.text}</span>
                </TemplatedNavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="mb-4 mt-auto">
        <ThemeToggle navTextClassName={navTextClassName} />
        <TemplatedNavLink urlTemplate={Urls.Settings} className={navLinkClassName}>
          <div className={navIconClassName}>
            <Settings />
          </div>
          <span className={navTextClassName}>Settings</span>
        </TemplatedNavLink>
      </div>
    </aside>
  )
}
