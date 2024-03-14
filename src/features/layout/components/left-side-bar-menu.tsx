import { TemplatedNavLink } from '../../routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '../../../routes/urls'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/features/primitive/components/navigation-menu'
import { cn } from '@/features/primitive/utils'

type Props = {
  className?: string
}

export function LeftSideBarMenu({ className }: Props) {
  return (
    <NavigationMenu className={cn('bg-secondary', className)}>
      <NavigationMenuList className={cn('flex-col items-start space-x-0')}>
        <NavigationMenuItem className={cn('flex h-12 items-center p-4')}>
          <NavigationMenuLink asChild>
            <TemplatedNavLink urlTemplate={Urls.Index} className={cn('[&.active]:text-primary')}>
              Home
            </TemplatedNavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className={cn('flex h-12 items-center p-4')}>
          <NavigationMenuLink asChild>
            <TemplatedNavLink urlTemplate={Urls.Explore} className={cn('[&.active]:text-primary')}>
              Explore
            </TemplatedNavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className={cn('flex h-12 items-center p-4')}>
          <NavigationMenuLink asChild>
            <TemplatedNavLink urlTemplate={Urls.AppStudio} className={cn('[&.active]:text-primary')}>
              App Studio
            </TemplatedNavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
