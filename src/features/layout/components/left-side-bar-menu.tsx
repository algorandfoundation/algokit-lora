import { TemplatedNavLink } from '../../routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/features/common/components/navigation-menu'
import { cn } from '@/features/common/utils'
import { Button } from '@/features/common/components/button'
import { useCallback } from 'react'
import { useSelectedNetwork } from '@/features/network/data'
import { Telescope, Settings, PanelLeftClose, PanelLeftOpen, ArrowLeft, Coins, FlaskConical } from 'lucide-react'
import { ThemeToggle } from '@/features/settings/components/theme-toggle'
import { useNavigate } from 'react-router-dom'
import { useLayout } from '@/features/settings/data'

type Props = {
  className?: string
}

const navIconClassName = cn('border rounded-md p-2 ml-2')
const navLinkClassName = cn(
  '[&.active]:border-border [&.active]:bg-accent [&.active]:text-primary border border-card rounded-r-md p-[0.34rem] mr-2 gap-2 flex items-center whitespace-nowrap hover:text-primary'
)

export function LeftSideBarMenu({ className }: Props) {
  const [selectedNetwork] = useSelectedNetwork()
  const navigate = useNavigate()

  const menuItems = [
    { urlTemplate: Urls.Explore, icon: <Telescope />, text: 'Explore' },
    { urlTemplate: Urls.AppLab, icon: <FlaskConical />, text: 'App Lab' },
    // { urlTemplate: Urls.TransactionWizard, icon: <SvgWizard width={24} height={24} />, text: 'Txn Wizard' },
    { urlTemplate: Urls.Fund, icon: <Coins />, text: 'Fund' },
  ]
  const [layout, setLayout] = useLayout()

  const toggleLeftSideBar = useCallback(
    () => setLayout((prev) => ({ ...prev, isLeftSideBarExpanded: !prev.isLeftSideBarExpanded })),
    [setLayout]
  )

  const navTextClassName = cn(
    layout.isLeftSideBarExpanded
      ? 'visible transition-[visibility] duration-0 delay-100'
      : 'invisible w-0 transition-[visibility] duration-0 delay-100'
  )

  return (
    <aside
      className={cn(
        'flex flex-col bg-card border-r transition-[width] duration-300',
        className,
        layout.isLeftSideBarExpanded ? 'w-56' : 'w-[4.5rem]'
      )}
    >
      <Button className="ml-auto text-muted-foreground" variant="no-style" size="icon" onClick={toggleLeftSideBar}>
        {layout.isLeftSideBarExpanded ? <PanelLeftClose /> : <PanelLeftOpen />}
      </Button>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <button className={navLinkClassName} onClick={() => navigate(-1)}>
                <div className={navIconClassName}>
                  <ArrowLeft />
                </div>
                <span className={navTextClassName}>Back</span>
              </button>
            </NavigationMenuLink>
          </NavigationMenuItem>
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
