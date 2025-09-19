'use client'

import * as React from 'react'
import { useForm, UseFormProps, FieldValues, Path, get } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export interface FormField<T extends FieldValues> {
  name: Path<T>
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'switch'
  placeholder?: string
  description?: string
  options?: { label: string; value: string | number }[]
  validation?: {
    required?: boolean | string
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: {
      value: RegExp
      message: string
    }
  }
}

interface FormProps<T extends FieldValues> extends UseFormProps<T> {
  fields: FormField<T>[]
  onSubmit: (data: T) => void | Promise<void>
  schema?: z.ZodType<T>
  submitText?: string
  loading?: boolean
  success?: boolean
  error?: string
  className?: string
}

export function Form<T extends FieldValues>({
  fields,
  onSubmit,
  schema,
  submitText = 'Submit',
  loading,
  success,
  error,
  className,
  ...formProps
}: FormProps<T>) {
  const form = useForm<T>({
    ...formProps,
    resolver: schema ? zodResolver(schema) : undefined,
  })

  const { register, handleSubmit, formState: { errors }, control } = form

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
    >
      {/* Form Fields */}
      {fields.map((field) => {
        const error = get(errors, field.name)

        return (
          <div key={field.name} className="space-y-2">
            <Label
              htmlFor={field.name}
              className={cn(error && 'text-destructive')}
            >
              {field.label}
              {field.validation?.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>

            {field.type === 'textarea' ? (
              <Textarea
                id={field.name}
                placeholder={field.placeholder}
                className={cn(error && 'border-destructive')}
                {...register(field.name)}
              />
            ) : field.type === 'select' ? (
              <Select
                onValueChange={(value) => form.setValue(field.name, value)}
                defaultValue={form.getValues(field.name)}
              >
                <SelectTrigger
                  className={cn(error && 'border-destructive')}
                >
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={String(option.value)}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.name}
                  onCheckedChange={(checked) =>
                    form.setValue(field.name, checked)
                  }
                />
                {field.description && (
                  <label
                    htmlFor={field.name}
                    className="text-sm text-muted-foreground"
                  >
                    {field.description}
                  </label>
                )}
              </div>
            ) : field.type === 'switch' ? (
              <div className="flex items-center space-x-2">
                <Switch
                  id={field.name}
                  onCheckedChange={(checked) =>
                    form.setValue(field.name, checked)
                  }
                />
                {field.description && (
                  <label
                    htmlFor={field.name}
                    className="text-sm text-muted-foreground"
                  >
                    {field.description}
                  </label>
                )}
              </div>
            ) : (
              <Input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                className={cn(error && 'border-destructive')}
                {...register(field.name)}
              />
            )}

            {/* Field Description */}
            {field.description && field.type !== 'checkbox' && field.type !== 'switch' && (
              <p className="text-sm text-muted-foreground">
                {field.description}
              </p>
            )}

            {/* Field Error */}
            {error && (
              <p className="text-sm text-destructive">
                {error.message as string}
              </p>
            )}
          </div>
        )
      })}

      {/* Form Status */}
      {(error || success) && (
        <div
          className={cn(
            'p-4 rounded-lg text-sm flex items-center',
            error
              ? 'bg-destructive/10 text-destructive'
              : 'bg-success/10 text-success'
          )}
        >
          {error ? (
            <AlertCircle className="h-4 w-4 mr-2" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          <p>{error || 'Form submitted successfully'}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Loading...
          </>
        ) : (
          submitText
        )}
      </Button>
    </form>
  )
}

// Example Usage
export function ContactForm() {
  const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
    subscribe: z.boolean().optional(),
  })

  const fields: FormField<z.infer<typeof schema>>[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter your name',
      validation: {
        required: 'Name is required',
      },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter your email',
      validation: {
        required: 'Email is required',
      },
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Enter your message',
      validation: {
        required: 'Message is required',
      },
    },
    {
      name: 'subscribe',
      label: 'Subscribe to newsletter',
      type: 'checkbox',
      description: 'Receive updates and news about our platform',
    },
  ]

  const onSubmit = async (data: z.infer<typeof schema>) => {
    // Handle form submission
    console.log(data)
  }

  return (
    <Form
      fields={fields}
      onSubmit={onSubmit}
      schema={schema}
      submitText="Send Message"
    />
  )
}

// Loading State
export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array(3).fill(null).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
        </div>
      ))}
      <div className="h-10 w-full bg-muted rounded" />
    </div>
  )
}