import { TemplatedNavLink } from '../../routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '../../../routes/urls'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/features/primitive/components/navigation-menu'
import { cn } from '@/features/primitive/utils'

type Props = {
  className?: string
}

export function LeftSideBarMenu({ className }: Props) {
  return (
    <NavigationMenu className={cn('bg-card', className)}>
      <NavigationMenuList className={cn('flex-col items-start space-x-0')}>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <TemplatedNavLink urlTemplate={Urls.Index} className={cn('[&.active]:text-primary flex h-12 items-center p-4')}>
              Home
            </TemplatedNavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <TemplatedNavLink urlTemplate={Urls.Explore} className={cn('[&.active]:text-primary flex h-12 items-center p-4')}>
              Explore
            </TemplatedNavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <TemplatedNavLink urlTemplate={Urls.AppStudio} className={cn('[&.active]:text-primary flex h-12 items-center p-4')}>
              App Studio
            </TemplatedNavLink>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
