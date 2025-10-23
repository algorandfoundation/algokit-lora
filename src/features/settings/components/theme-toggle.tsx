import { Moon, Sun } from 'lucide-react'
import { Button } from '@/features/common/components/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/features/common/components/dropdown-menu'
import { useSelectedTheme } from '@/features/settings/data'

export const themeTogglelabel = 'Toggle theme'

type Props = {
  navTextClassName: string
}

const themeLabels = new Map([
  ['light', 'Light'],
  ['dark', 'Dark'],
  ['system', 'System'],
])

export function ThemeToggle({ navTextClassName }: Props) {
  const [theme, setTheme] = useSelectedTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="no-style"
          aria-label={themeTogglelabel}
          className="hover:text-primary flex items-center gap-2 text-base font-normal whitespace-nowrap"
        >
          <div className="flex rounded-md border p-2">
            <Sun className="scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
          </div>
          <span className={navTextClassName}>{themeLabels.get(theme)}</span>
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
