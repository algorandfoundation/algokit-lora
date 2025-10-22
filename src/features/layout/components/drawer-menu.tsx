import { useCallback, useEffect, useMemo } from 'react'
import { TemplatedNavLink } from '@/features/routing/components/templated-nav-link/templated-nav-link'
import { Urls } from '@/routes/urls'
import { Telescope, FlaskConical, Coins, X, Settings } from 'lucide-react'
import { Search } from '@/features/search/components/search'
import SvgWizard from '@/features/common/components/icons/wizard'
import { cn } from '@/features/common/utils'
import { useSelectedNetwork } from '@/features/network/data'
import { useLayout } from '@/features/settings/data'
import SvgLoraDark from '@/features/common/components/svg/lora-dark'
import SvgLoraLight from '@/features/common/components/svg/lora-light'
import { NetworkSelect } from '@/features/network/components/network-select'
import { ThemeToggle } from '@/features/settings/components/theme-toggle'

const itemBase =
  'flex items-center gap-3 rounded-md border border-transparent px-3 py-2 hover:bg-accent hover:text-primary transition-colors'
const itemActive = '[&.active]:bg-accent [&.active]:text-primary [&.active]:border-border'
const iconBox = 'border rounded-md p-2'

export default function DrawerMenu() {
  const [selectedNetwork] = useSelectedNetwork()
  const [layout, setLayout] = useLayout()
  const isOpen = !!layout.isDrawerMenuExpanded

  const menuItems = useMemo(
    () => [
      { urlTemplate: Urls.Network.Explore, icon: <Telescope />, text: 'Explore' },
      { urlTemplate: Urls.Network.AppLab, icon: <FlaskConical />, text: 'App Lab' },
      { urlTemplate: Urls.Network.TransactionWizard, icon: <SvgWizard width={24} height={24} />, text: 'Txn Wizard' },
      { urlTemplate: Urls.Network.Fund, icon: <Coins />, text: 'Fund' },
    ],
    []
  )

  const navTextClassName = cn('visible transition-[visibility] duration-0 delay-100')

  const navIconClassName = cn('border rounded-md p-2')

  const handleClose = useCallback(() => setLayout((prev: any) => ({ ...prev, isDrawerMenuExpanded: false })), [setLayout])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', onKey)
        document.body.style.overflow = prev
      }
    }
  }, [isOpen, handleClose])

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-opacity duration-300',
        // fade backdrop in/out; disable pointer events when closed
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        // respect reduced motion
        'motion-reduce:transition-none'
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <button aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={handleClose} />

      <aside
        className={cn(
          'absolute right-0 top-0 h-full w-full md:w-4/7 bg-card border-r shadow-xl flex flex-col',
          'transition-transform duration-300 will-change-transform',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          'motion-reduce:transition-none'
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex flex-col items-start p-3 gap-4">
          <div className="flex items-baseline justify-between w-full">
            <TemplatedNavLink urlTemplate={Urls.Network.Explore} className="self-center">
              <SvgLoraLight onClick={handleClose} className="block dark:hidden" />
              <SvgLoraDark onClick={handleClose} className="hidden dark:block" />
            </TemplatedNavLink>
            <button className="text-muted-foreground hover:text-foreground p-2" onClick={handleClose} aria-label="Close">
              <X />
            </button>
          </div>

          <Search />
        </div>

        {/* Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item, idx) => (
            <div onClick={handleClose}>
              <TemplatedNavLink
                key={idx}
                urlTemplate={item.urlTemplate}
                urlParams={{ networkId: selectedNetwork }}
                className={cn(itemBase, itemActive)}
                end={item.text === 'Explore'}
              >
                <div className={iconBox}>{item.icon}</div>
                <span className="whitespace-nowrap">{item.text}</span>
              </TemplatedNavLink>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto mb-4 p-3 flex justify-between items-center text-xs text-muted-foreground">
          <NetworkSelect />
          <div className="mt-6 flex">
            <ThemeToggle navTextClassName={navTextClassName} />
            <TemplatedNavLink urlTemplate={Urls.Settings} className={'flex flex-col items-center justify-center'}>
              <div onClick={handleClose} className={navIconClassName}>
                <Settings />
              </div>
            </TemplatedNavLink>
          </div>
        </div>
      </aside>
    </div>
  )
}
