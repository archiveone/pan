import { PAGE_CONFIGS, SHARED_COMPONENTS } from '../config/ui-automation'
import fs from 'fs'
import path from 'path'

// Component template with modern styling
const componentTemplate = (name: string) => `
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

interface ${name}Props {
  className?: string
}

export const ${name} = ({ className }: ${name}Props) => {
  const { theme } = useTheme()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border bg-card p-6 shadow-lg',
        'hover:shadow-xl transition-all duration-200',
        'dark:bg-gray-800 dark:border-gray-700',
        className
      )}
    >
      {/* Component content */}
    </motion.div>
  )
}
`

// Layout template with modern styling
const layoutTemplate = (name: string) => `
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ${name}Props {
  children: React.ReactNode
  className?: string
}

export const ${name} = ({ children, className }: ${name}Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'min-h-screen bg-background',
        'dark:bg-gray-900',
        className
      )}
    >
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </motion.div>
  )
}
`

// Form component template with validation
const formComponentTemplate = (name: string) => `
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  // Add form validation schema
})

interface ${name}Props {
  className?: string
  onSubmit: (data: z.infer<typeof schema>) => void
}

export const ${name} = ({ className, onSubmit }: ${name}Props) => {
  const form = useForm({
    resolver: zodResolver(schema)
  })
  
  return (
    <form 
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn(
        'space-y-4',
        'dark:bg-gray-800',
        className
      )}
    >
      {/* Form fields */}
    </form>
  )
}
`

// Feedback component template
const feedbackComponentTemplate = (name: string) => `
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

interface ${name}Props {
  className?: string
  show?: boolean
}

export const ${name} = ({ className, show = true }: ${name}Props) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            'bg-black/50 backdrop-blur-sm',
            className
          )}
        >
          {/* Feedback content */}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
`

// Generate components based on configuration
async function generateComponents() {
  // Create base directories
  const componentsDir = path.join(process.cwd(), 'components')
  const layoutsDir = path.join(process.cwd(), 'layouts')
  
  !fs.existsSync(componentsDir) && fs.mkdirSync(componentsDir)
  !fs.existsSync(layoutsDir) && fs.mkdirSync(layoutsDir)

  // Generate page components
  Object.entries(PAGE_CONFIGS).forEach(([page, config]) => {
    const pageDir = path.join(componentsDir, page)
    !fs.existsSync(pageDir) && fs.mkdirSync(pageDir)

    config.components.forEach(component => {
      const componentPath = path.join(pageDir, `${component}.tsx`)
      fs.writeFileSync(componentPath, componentTemplate(component))
    })
  })

  // Generate shared components
  Object.entries(SHARED_COMPONENTS).forEach(([category, { components }]) => {
    const categoryDir = path.join(componentsDir, category)
    !fs.existsSync(categoryDir) && fs.mkdirSync(categoryDir)

    components.forEach(component => {
      const componentPath = path.join(categoryDir, `${component}.tsx`)
      const template = 
        category === 'layout' ? layoutTemplate :
        category === 'forms' ? formComponentTemplate :
        category === 'feedback' ? feedbackComponentTemplate :
        componentTemplate

      fs.writeFileSync(componentPath, template(component))
    })
  })

  console.log('✅ Components generated successfully')
}

generateComponents().catch(console.error)