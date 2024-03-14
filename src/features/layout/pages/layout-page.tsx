import { ReactNode } from 'react'
import { TemplatedNavLink } from '../../routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '../../../routes/urls'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/features/primitive/components/navigation-menu'
import { cn } from '@/features/primitive/utils'
import { ThemeToggle } from '@/features/theme/components/theme-toggle'
import { Header } from '../components/header'

export interface LayoutPageProps {
  children?: ReactNode
}

export function LayoutPage({ children }: LayoutPageProps) {
  return (
    <>
      <Header />
      <NavigationMenu>
        <NavigationMenuList className={cn('flex-col items-start space-x-0')}>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <TemplatedNavLink urlTemplate={Urls.Feature1}>Feature 1</TemplatedNavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <TemplatedNavLink urlTemplate={Urls.Transaction.ById} urlParams={{ transactionId: '42' }}>
                View transaction
              </TemplatedNavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <ThemeToggle />
      {children}
    </>
  )
}
