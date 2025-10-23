// src/features/layout/config/menu-items.ts

import { Telescope, FlaskConical, Coins } from 'lucide-react'
import SvgWizard from '@/features/common/components/icons/wizard'
import { Urls } from '@/routes/urls'

// ✅ Use an array of objects so it can be iterated
export const menuItems = [
  {
    urlTemplate: Urls.Network.Explore,
    icon: <Telescope />,
    text: 'Explore',
  },
  {
    urlTemplate: Urls.Network.AppLab,
    icon: <FlaskConical />,
    text: 'App Lab',
  },
  {
    urlTemplate: Urls.Network.TransactionWizard,
    icon: <SvgWizard width={24} height={24} />,
    text: 'Txn Wizard',
  },
  {
    urlTemplate: Urls.Network.Fund,
    icon: <Coins />,
    text: 'Fund',
  },
]
