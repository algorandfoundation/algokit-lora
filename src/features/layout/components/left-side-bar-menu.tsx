import { TemplatedNavLink } from '../../routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '../../../routes/urls'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/features/common/components/navigation-menu'
import { cn } from '@/features/common/utils'
import SvgCodeBlock from '@/features/common/components/icons/code-block'
import SvgHome from '@/features/common/components/icons/home'
import { Button } from '@/features/common/components/button'
import SvgChevronLeft from '@/features/common/components/icons/chevron-left'
import { useCallback, useMemo } from 'react'
import SvgChevronRight from '@/features/common/components/icons/chevron-right'
import SvgCog from '@/features/common/components/icons/cog'
import { useLayout } from '@/features/settings/data'
import { useLocation } from 'react-router-dom'

type Props = {
  className?: string
}

export function LeftSideBarMenu({ className }: Props) {
  const menuItems = [
    { urlTemplate: Urls.Index, icon: <SvgHome />, text: 'Home' },
    { urlTemplate: Urls.AppStudio, icon: <SvgCodeBlock />, text: 'App Studio' },
    { urlTemplate: Urls.Settings, icon: <SvgCog />, text: 'Settings' },
  ]
  const [layout, setLayout] = useLayout()

  const toggleLeftSideBar = useCallback(
    () => setLayout((prev) => ({ ...prev, isLeftSideBarExpanded: !prev.isLeftSideBarExpanded })),
    [setLayout]
  )

  // The little hack to make the index menu item active when transaction, block, account, asset, application are viewed
  // This needs to be done because by default React router doesn't match the index URLs with any sub-path
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
      className={cn('bg-card transition-all duration-300 min-h-screen', className, layout.isLeftSideBarExpanded ? 'w-52' : 'w-10')}
    >
      <NavigationMenuList className={cn('flex-col items-start')}>
        <NavigationMenuItem className={cn('flex justify-end')}>
          <Button variant="outline" size="icon" className={cn('text-primary')} onClick={toggleLeftSideBar}>
            {layout.isLeftSideBarExpanded ? <SvgChevronLeft /> : <SvgChevronRight />}
          </Button>
        </NavigationMenuItem>
        {menuItems.map((menuItem, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink asChild>
              <TemplatedNavLink
                urlTemplate={menuItem.urlTemplate}
                className={cn(
                  '[&.active]:text-primary flex items-center p-2 gap-2 min-h-10 pl-3 whitespace-nowrap',
                  menuItem.urlTemplate === Urls.Index && isIndexActive ? 'active' : ''
                )}
              >
                <div className={cn('text-primary')}>{menuItem.icon}</div>
                <div className={cn(layout.isLeftSideBarExpanded ? 'visible delay-100' : 'invisible delay-100')}>{menuItem.text}</div>
              </TemplatedNavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
