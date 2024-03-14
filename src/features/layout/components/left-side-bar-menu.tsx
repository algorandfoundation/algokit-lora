import { TemplatedNavLink } from '../../routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '../../../routes/urls'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/features/primitive/components/navigation-menu'
import { cn } from '@/features/primitive/utils'

export function LeftSideBarMenu() {
  return (
    <NavigationMenu className={cn('bg-secondary')}>
      <NavigationMenuList className={cn('flex-col items-start space-x-0')}>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <TemplatedNavLink urlTemplate={Urls.Feature1}>Home</TemplatedNavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <TemplatedNavLink urlTemplate={Urls.Feature1}>Explore</TemplatedNavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <TemplatedNavLink urlTemplate={Urls.Feature1}>App Studio</TemplatedNavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
