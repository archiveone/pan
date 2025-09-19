'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
  mode?: 'fade' | 'slide' | 'scale' | 'none'
  duration?: number
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.96, opacity: 0 },
  },
}

export function PageTransition({
  children,
  mode = 'fade',
  duration = 0.3,
}: PageTransitionProps) {
  const pathname = usePathname()

  if (mode === 'none') {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants[mode]}
        transition={{
          duration,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Variants for different sections
export function PropertyTransition({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition mode="slide" duration={0.4}>
      {children}
    </PageTransition>
  )
}

export function ServiceTransition({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition mode="scale" duration={0.4}>
      {children}
    </PageTransition>
  )
}

export function LeisureTransition({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition mode="fade" duration={0.3}>
      {children}
    </PageTransition>
  )
}

// Animation Components
export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideIn({
  children,
  direction = 'right',
  delay = 0,
  duration = 0.5,
  className = '',
}: {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  duration?: number
  className?: string
}) {
  const directionMap = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: -20 },
    down: { x: 0, y: 20 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({
  children,
  delay = 0.1,
  staggerDelay = 0.1,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  staggerDelay?: number
  className?: string
}) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      className={className}
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Hover Animations
export function HoverScale({
  children,
  scale = 1.05,
  className = '',
}: {
  children: React.ReactNode
  scale?: number
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function HoverElevate({
  children,
  y = -5,
  className = '',
}: {
  children: React.ReactNode
  y?: number
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ y }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Loading Animation
export function LoadingSpinner({
  size = 40,
  color = 'currentColor',
}: {
  size?: number
  color?: string
}) {
  return (
    <motion.div
      style={{
        width: size,
        height: size,
        border: `4px solid ${color}`,
        borderTop: `4px solid transparent`,
        borderRadius: '50%',
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

// Scroll Animations
export function ScrollReveal({
  children,
  threshold = 0.1,
  className = '',
}: {
  children: React.ReactNode
  threshold?: number
  className?: string
}) {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true,
  })

  React.useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 20 },
      }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}