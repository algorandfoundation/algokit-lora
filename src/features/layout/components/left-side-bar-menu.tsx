import { TemplatedNavLink } from '../../routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '../../../routes/urls'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/features/common/components/navigation-menu'
import { cn } from '@/features/common/utils'
import SvgWallet from '@/features/common/components/icons/wallet'
import SvgCodeBlock from '@/features/common/components/icons/code-block'
import SvgHome from '@/features/common/components/icons/home'
import { Button } from '@/features/common/components/button'
import SvgChevronLeft from '@/features/common/components/icons/chevron-left'
import { useCallback } from 'react'
import { useLayout } from '../hooks/use-layout'
import SvgChevronRight from '@/features/common/components/icons/chevron-right'

type Props = {
  className?: string
}

export function LeftSideBarMenu({ className }: Props) {
  const menuItems = [
    { urlTemplate: Urls.Index, icon: <SvgHome />, text: 'Home' },
    { urlTemplate: Urls.Explore, icon: <SvgWallet />, text: 'Explore' },
    { urlTemplate: Urls.AppStudio, icon: <SvgCodeBlock />, text: 'App Studio' },
  ]
  const { isLeftSideBarExpanded, setIsLeftSideBarExpanded } = useLayout()

  const toggleLeftSideBar = useCallback(
    () => setIsLeftSideBarExpanded(!isLeftSideBarExpanded),
    [isLeftSideBarExpanded, setIsLeftSideBarExpanded]
  )

  return (
    <NavigationMenu className={cn('bg-card', className, 'transition-all duration-300', isLeftSideBarExpanded ? 'w-52' : 'w-10')}>
      <NavigationMenuList className={cn('flex-col items-start')}>
        <NavigationMenuItem className={cn('flex justify-end')}>
          <Button variant="outline" size="icon" className={cn('text-primary')} onClick={toggleLeftSideBar}>
            {isLeftSideBarExpanded ? <SvgChevronLeft /> : <SvgChevronRight />}
          </Button>
        </NavigationMenuItem>
        {menuItems.map((menuItem, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink asChild>
              <TemplatedNavLink
                urlTemplate={menuItem.urlTemplate}
                className={cn('[&.active]:text-primary flex items-center p-2 gap-2 min-h-10 pl-3 whitespace-nowrap')}
              >
                <div className={cn('text-primary leading-6')}>{menuItem.icon}</div>
                <div className={cn(isLeftSideBarExpanded ? 'visible' : 'invisible delay-100')}>{menuItem.text}</div>
              </TemplatedNavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
