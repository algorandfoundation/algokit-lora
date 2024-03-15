import { TemplatedNavLink } from '../../routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '../../../routes/urls'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/features/common/components/navigation-menu'
import { cn } from '@/features/common/utils'
import SvgWallet from '@/features/common/components/icons/wallet'
import SvgCodeBlock from '@/features/common/components/icons/code-block'
import SvgHome from '@/features/common/components/icons/home'

type Props = {
  className?: string
}

export function LeftSideBarMenu({ className }: Props) {
  const menuItems = [
    { urlTemplate: Urls.Index, icon: <SvgHome />, text: 'Home' },
    { urlTemplate: Urls.Explore, icon: <SvgWallet />, text: 'Explore' },
    { urlTemplate: Urls.AppStudio, icon: <SvgCodeBlock />, text: 'App Studio' },
  ]

  return (
    <NavigationMenu className={cn('bg-card', className)}>
      <NavigationMenuList className={cn('flex-col items-start space-x-0')}>
        {menuItems.map((menuItem, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink asChild>
              <TemplatedNavLink urlTemplate={menuItem.urlTemplate} className={cn('[&.active]:text-primary flex items-center p-2 gap-2')}>
                <div className={cn('text-primary')}>{menuItem.icon}</div>
                {menuItem.text}
              </TemplatedNavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
