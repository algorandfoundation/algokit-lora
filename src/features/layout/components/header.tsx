import SvgLoraDark from '@/features/common/components/svg/lora-dark'
import SvgLoraLight from '@/features/common/components/svg/lora-light'
import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Search } from '@/features/search/components/search'
import { useNetworkConfig } from '@/features/network/data'
import { ConnectWalletButton } from '@/features/wallet/components/connect-wallet-button'
import { Urls } from '@/routes/urls'
import { NetworkSelect } from '@/features/network/components/network-select'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import DrawerMenu from './drawer-menu'

import { useCallback } from 'react'
import { useLayout } from '@/features/settings/data'

type Props = {
  className?: string
}

export function Header({ className }: Props) {
  const networkConfig = useNetworkConfig()
  const [_layout, setLayout] = useLayout()

  const openDrawerMenu = useCallback(
    () => setLayout((prev) => ({ ...prev, isDrawerMenuExpanded: !prev.isDrawerMenuExpanded })),
    [setLayout]
  )

  return (
    <header className={cn('bg-card text-card-foreground flex h-20 px-4 justify-start border-b', className)}>
      <div className={cn('flex items-baseline gap-4')}>
        <TemplatedNavLink urlTemplate={Urls.Network.Explore} urlParams={{ networkId: networkConfig.id }} className="self-center">
          <SvgLoraLight className="block dark:hidden" />
          <SvgLoraDark className="hidden dark:block" />
        </TemplatedNavLink>
        <Search className="hidden lg:flex" />
      </div>
      <div className={cn('flex items-center gap-3 ml-auto overflow-hidden')}>
        <NetworkSelect className="hidden lg:flex" showLabel={false} />
        <ConnectWalletButton />
        <HamburgerMenuIcon onClick={openDrawerMenu} className="lg:hidden text-xl w-8 h-8" />
        <DrawerMenu />
      </div>
    </header>
  )
}
