'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ModalProps {
  trigger?: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showClose?: boolean
  className?: string
  loading?: boolean
}

export function Modal({
  trigger,
  title,
  description,
  children,
  footer,
  size = 'md',
  open,
  onOpenChange,
  showClose = true,
  className,
  loading,
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw]',
  }

  const content = (
    <DialogContent
      className={cn(
        sizeClasses[size],
        'overflow-y-auto max-h-[85vh]',
        className
      )}
    >
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          {showClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onOpenChange?.(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
        {description && (
          <DialogDescription>{description}</DialogDescription>
        )}
      </DialogHeader>

      {loading ? (
        <div className="py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="py-4">{children}</div>
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </>
      )}
    </DialogContent>
  )

  if (trigger) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {content}
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  )
}

// Variants
export function ConfirmModal({
  trigger,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading,
  danger,
}: {
  trigger?: React.ReactNode
  title: string
  description: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  loading?: boolean
  danger?: boolean
}) {
  const [open, setOpen] = React.useState(false)

  const handleConfirm = async () => {
    await onConfirm()
    setOpen(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setOpen(false)
  }

  return (
    <Modal
      trigger={trigger}
      title={title}
      description={description}
      open={open}
      onOpenChange={setOpen}
      loading={loading}
      size="sm"
      footer={
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={danger ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {confirmText}
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      }
    >
      {/* Empty children as content is in description */}
    </Modal>
  )
}

export function ImageModal({
  trigger,
  src,
  alt,
  caption,
}: {
  trigger: React.ReactNode
  src: string
  alt: string
  caption?: string
}) {
  return (
    <Modal
      trigger={trigger}
      title={caption || alt}
      size="xl"
      className="p-0 overflow-hidden"
    >
      <div className="relative aspect-video">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
        />
      </div>
    </Modal>
  )
}

export function FormModal({
  trigger,
  title,
  description,
  form,
  onSubmit,
  submitText = 'Submit',
  loading,
}: {
  trigger?: React.ReactNode
  title: string
  description?: string
  form: React.ReactNode
  onSubmit: () => void | Promise<void>
  submitText?: string
  loading?: boolean
}) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async () => {
    await onSubmit()
    setOpen(false)
  }

  return (
    <Modal
      trigger={trigger}
      title={title}
      description={description}
      open={open}
      onOpenChange={setOpen}
      loading={loading}
      footer={
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {submitText}
              </>
            ) : (
              submitText
            )}
          </Button>
        </div>
      }
    >
      {form}
    </Modal>
  )
}

// Loading State
export function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-background rounded-lg p-6 w-full max-w-md mx-4 animate-pulse">
        <div className="h-6 w-1/2 bg-muted rounded mb-4" />
        <div className="h-24 w-full bg-muted rounded mb-4" />
        <div className="flex justify-end space-x-2">
          <div className="h-10 w-24 bg-muted rounded" />
          <div className="h-10 w-24 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}