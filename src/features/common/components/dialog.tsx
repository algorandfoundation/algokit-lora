import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { cn } from '../utils'
import { useEffect, useRef } from 'react'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0', className)}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps extends DialogPrimitive.DialogContentProps {
  hideClose?: boolean
}

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ className, children, hideClose, ...props }, ref) => {
    // Used to detect when a component is first mounted, so that if a dialog is open on mount, it doesn't run the open animations.
    const mounted = useRef<boolean>(false)
    useEffect(() => {
      if (!mounted.current) {
        setTimeout(() => {
          mounted.current = true
        }, 100)
        return
      }
    }, [])

    return (
      <DialogPortal>
        <DialogOverlay
          className={cn(
            'fixed inset-0 z-50 bg-black/80',
            mounted.current &&
              'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out'
          )}
        />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            'fixed top-0 left-0 w-full h-full md:w-auto md:h-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 grid gap-3 border bg-background shadow-lg duration-200 md:rounded-lg pt-4 [&:has(h2)]:pt-2.5',
            mounted.current &&
              'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out',
            className
          )}
          {...props}
          tabIndex={undefined}
        >
          {children}
          {!hideClose && (
            <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-hidden">
              <Cross2Icon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  }
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 sm:text-left px-4', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn('pb-0', className)} {...props} />)
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

export function MediumSizeDialogBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('w-full md:w-3xl md:max-h-[600px] overflow-auto px-4 pt-1 pb-4', className)}>{children}</div>
}

export function SmallSizeDialogBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('w-full md:w-[500px]  overflow-auto px-4 pt-1 pb-4', className)}>{children}</div>
}
