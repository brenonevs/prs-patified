'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { ShimmerButton } from '@/components/ui/shimmer-button'

const FEATHER = '🪶'
const FEATHER_COUNT = 45
const BURST_RADIUS_MIN = 40
const BURST_RADIUS_MAX = 100

interface FeatherParticle {
  id: number
  angle: number
  radius: number
  rotation: number
  size: number
}

export function PatifyButton() {
  const router = useRouter()
  const [feathers, setFeathers] = useState<FeatherParticle[]>([])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const particles: FeatherParticle[] = Array.from({ length: FEATHER_COUNT }, (_, i) => ({
        id: Date.now() + i,
        angle: Math.random() * 360,
        radius: BURST_RADIUS_MIN + Math.random() * (BURST_RADIUS_MAX - BURST_RADIUS_MIN),
        rotation: (Math.random() - 0.5) * 720,
        size: 0.7 + Math.random() * 0.8
      }))
      setFeathers(particles)
      setTimeout(() => {
        setFeathers([])
        router.push('/login')
      }, 700)
    },
    [router]
  )

  return (
    <div className="relative inline-block">
      <AnimatePresence>
        {feathers.map(({ id, angle, radius, rotation, size }) => {
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * radius
          const y = Math.sin(rad) * radius
          return (
            <motion.span
              key={id}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl"
              style={{ fontSize: `${size * 1.25}rem` }}
              initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: 0,
                x,
                y: y + 30,
                rotate: rotation
              }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              exit={{ opacity: 0 }}
            >
              {FEATHER}
            </motion.span>
          )
        })}
      </AnimatePresence>
      <ShimmerButton
        asChild
        className="shadow-2xl"
        shimmerSize="2px"
        shimmerColor="rgba(255,255,255,0.9)"
        background="rgba(38, 38, 38, 1)"
      >
        <Link href="/login" onClick={handleClick}>
          <span className="text-center text-sm font-medium leading-none tracking-tight text-white whitespace-nowrap lg:text-lg dark:from-white dark:to-slate-900/10 flex items-center gap-2">
            Patifique
            <span className="inline-block transition-transform duration-200 group-hover:scale-110 group-active:scale-90">
              🐤
            </span>
          </span>
        </Link>
      </ShimmerButton>
    </div>
  )
}
