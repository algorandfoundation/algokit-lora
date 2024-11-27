import SvgLoraDark from '@/features/common/components/svg/lora-dark'
import SvgLoraLight from '@/features/common/components/svg/lora-light'
import { cn } from '@/features/common/utils'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Search } from '@/features/search/components/search'
import { useNetworkConfig } from '@/features/network/data'
import { ConnectWalletButton } from '@/features/wallet/components/connect-wallet-button'
import { Urls } from '@/routes/urls'
import { NetworkSelect } from '@/features/network/components/network-select'

type Props = {
  className?: string
}

export function Header({ className }: Props) {
  const networkConfig = useNetworkConfig()

  return (
    <header className={cn('bg-card text-card-foreground flex h-20 px-4 justify-start border-b', className)}>
      <div className={cn('flex items-baseline gap-4')}>
        <TemplatedNavLink urlTemplate={Urls.Network.Explore} urlParams={{ networkId: networkConfig.id }} className="self-center">
          <SvgLoraLight className="block dark:hidden" />
          <SvgLoraDark className="hidden dark:block" />
        </TemplatedNavLink>
        <Search />
      </div>
      <div className={cn('flex items-center gap-2 ml-auto overflow-hidden pl-1')}>
        <NetworkSelect showLabel={false} />
        <ConnectWalletButton />
      </div>
    </header>
  )
}
