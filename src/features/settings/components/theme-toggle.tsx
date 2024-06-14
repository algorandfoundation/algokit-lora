import { Moon, Sun } from 'lucide-react'
import { Button } from '@/features/common/components/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/features/common/components/dropdown-menu'
import { useSelectedTheme } from '@/features/settings/data'
import { cn } from '@/features/common/utils'

export const themeTogglelabel = 'Toggle theme'

type Props = {
  isLeftSideBarExpanded: boolean
}

const themeLabels = new Map([
  ['light', 'Light'],
  ['dark', 'Dark'],
  ['system', 'System'],
])

export function ThemeToggle({ isLeftSideBarExpanded }: Props) {
  const [theme, setTheme] = useSelectedTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="no-style"
          aria-label={themeTogglelabel}
          className="flex min-h-10 items-center gap-2 whitespace-nowrap p-2 pl-3 text-base font-normal"
        >
          <div className="grid">
            <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>
          <span className={cn(isLeftSideBarExpanded ? 'visible delay-100' : 'invisible w-0 delay-100')}>{themeLabels.get(theme)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right">
        <DropdownMenuItem onClick={() => setTheme('light')}>{themeLabels.get('light')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>{themeLabels.get('dark')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>{themeLabels.get('system')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
