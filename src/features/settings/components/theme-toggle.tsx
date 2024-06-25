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
          className="my-1.5 flex items-center gap-2 whitespace-nowrap px-2 text-base font-normal hover:text-primary"
        >
          <div className="ml-[0.4rem] flex rounded-md border p-2">
            <Sun className="rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
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
