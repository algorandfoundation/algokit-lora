import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { CheckIcon, ChevronDown, XIcon } from 'lucide-react'
import { cn } from '@/features/common/utils'
import { Separator } from '@/features/common/components/separator'
import { Button } from '@/features/common/components/button'
import { Badge } from '@/features/common/components/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/features/common/components/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/features/common/components/command'

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva('px-2 py-3 text-sm font-normal', {
  variants: {
    variant: {
      default: 'border-foreground/10 bg-card text-foreground hover:bg-card/80',
      secondary: 'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type Option = {
  /** The text to display for the option. */
  label: string
  /** The unique value associated with the option. */
  value: string
  /** Optional icon component to display alongside the option. */
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: Option[]

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void

  /** The default selected values when the component mounts. */
  defaultValue: string[]

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = 'Select options',
      maxCount = 3,
      modalPopover = false,
      className,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue)
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

    React.useEffect(() => {
      if (JSON.stringify(selectedValues) !== JSON.stringify(defaultValue)) {
        setSelectedValues(selectedValues)
      }
    }, [defaultValue, selectedValues])

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true)
      } else if (event.key === 'Backspace' && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues]
        newSelectedValues.pop()
        setSelectedValues(newSelectedValues)
        onValueChange(newSelectedValues)
      }
    }

    const toggleOption = (value: string) => {
      const newSelectedValues = selectedValues.includes(value) ? selectedValues.filter((v) => v !== value) : [...selectedValues, value]
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues)
    }

    const handleClear = () => {
      setSelectedValues([])
      onValueChange([])
    }

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev)
    }

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount)
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues)
    }

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear()
      } else {
        const allValues = options.map((option) => option.value)
        setSelectedValues(allValues)
        onValueChange(allValues)
      }
    }

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              'flex w-full p-1 rounded-md border border-input min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit',
              className
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-wrap items-center gap-1">
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const option = options.find((o) => o.value === value)
                    const IconComponent = option?.icon
                    return (
                      <Badge key={value} className={cn(multiSelectVariants({ variant }))}>
                        {IconComponent && <IconComponent className="mr-2 size-4" />}
                        {option?.label}
                        <XIcon
                          className="ml-2 size-3.5 cursor-pointer hover:text-foreground/60"
                          onClick={(event) => {
                            event.stopPropagation()
                            toggleOption(value)
                          }}
                        />
                      </Badge>
                    )
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge className={cn(multiSelectVariants({ variant }))}>
                      {`+ ${selectedValues.length - maxCount} more`}
                      <XIcon
                        className="ml-2 size-3.5 cursor-pointer hover:text-foreground/60"
                        onClick={(event) => {
                          event.stopPropagation()
                          clearExtraOptions()
                        }}
                      />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="mx-2 h-4 cursor-pointer text-muted-foreground"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleClear()
                    }}
                  />
                  <Separator orientation="vertical" className="flex h-full min-h-6" />
                  <ChevronDown className="mx-2 h-4 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="mx-auto flex w-full items-center justify-between">
                <span className="mx-3 text-sm font-normal text-muted-foreground">{placeholder}</span>
                <ChevronDown className="mx-2 h-4 cursor-pointer text-muted-foreground" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" onEscapeKeyDown={() => setIsPopoverOpen(false)}>
          <Command>
            <CommandInput placeholder="Search..." onKeyDown={handleInputKeyDown} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <CommandItem key="all" onSelect={toggleAll} className="cursor-pointer">
                  <div
                    className={cn(
                      'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                      selectedValues.length === options.length ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <CheckIcon className="size-4" />
                  </div>
                  <span>(Select All)</span>
                </CommandItem>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <CommandItem key={option.value} onSelect={() => toggleOption(option.value)} className="cursor-pointer">
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                          isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <CheckIcon className="size-4" />
                      </div>
                      {option.icon && <option.icon className="mr-2 size-4 text-muted-foreground" />}
                      <span>{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem onSelect={handleClear} className="flex-1 cursor-pointer justify-center">
                        Clear
                      </CommandItem>
                      <Separator orientation="vertical" className="flex h-full min-h-6" />
                    </>
                  )}
                  <CommandSeparator />
                  <CommandItem onSelect={() => setIsPopoverOpen(false)} className="flex-1 cursor-pointer justify-center">
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

MultiSelect.displayName = 'MultiSelect'
