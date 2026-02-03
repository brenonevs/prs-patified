'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import './TextCursor.css'

interface TextCursorProps {
  text: string
  spacing?: number
  followMouseDirection?: boolean
  randomFloat?: boolean
  /** Intensidade do flutuar (0 = nenhum, 1 = máximo). Valores menores deixam o efeito mais suave. */
  floatAmount?: number
  exitDuration?: number
  removalInterval?: number
  maxPoints?: number
}

interface TrailItem {
  id: number
  x: number
  y: number
  angle: number
  randomX?: number
  randomY?: number
  randomRotate?: number
}

const FLOAT_RANGE = 5
const FLOAT_ANIMATION_DURATION = 3

const TextCursor: React.FC<TextCursorProps> = ({
  text = '⚛️',
  spacing = 100,
  followMouseDirection = true,
  randomFloat = true,
  floatAmount = 1,
  exitDuration = 0.5,
  removalInterval = 30,
  maxPoints = 5
}) => {
  const floatScale = Math.max(0, Math.min(1, floatAmount))
  const [trail, setTrail] = useState<TrailItem[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const lastMoveTimeRef = useRef<number>(Date.now())
  const idCounter = useRef<number>(0)

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      return
    }
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setTrail(prev => {
      const newTrail = [...prev]

      const createRandomData = () =>
        randomFloat && floatScale > 0
          ? {
              randomX: (Math.random() * 2 - 1) * FLOAT_RANGE * floatScale,
              randomY: (Math.random() * 2 - 1) * FLOAT_RANGE * floatScale,
              randomRotate: (Math.random() * 2 - 1) * FLOAT_RANGE * floatScale
            }
          : {}

      if (newTrail.length === 0) {
        newTrail.push({
          id: idCounter.current++,
          x: mouseX,
          y: mouseY,
          angle: 0,
          ...createRandomData()
        })
      } else {
        const last = newTrail[newTrail.length - 1]
        const dx = mouseX - last.x
        const dy = mouseY - last.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance >= spacing) {
          const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI
          const computedAngle = followMouseDirection ? rawAngle : 0
          const steps = Math.floor(distance / spacing)

          for (let i = 1; i <= steps; i++) {
            const t = (spacing * i) / distance
            const newX = last.x + dx * t
            const newY = last.y + dy * t

            newTrail.push({
              id: idCounter.current++,
              x: newX,
              y: newY,
              angle: computedAngle,
              ...createRandomData()
            })
          }
        }
      }

      if (newTrail.length > maxPoints) {
        return newTrail.slice(newTrail.length - maxPoints)
      }
      return newTrail
    })

    lastMoveTimeRef.current = Date.now()
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMoveTimeRef.current > 100) {
        setTrail(prev => (prev.length > 0 ? prev.slice(1) : prev))
      }
    }, removalInterval)
    return () => clearInterval(interval)
  }, [removalInterval])

  return (
    <div ref={containerRef} className="text-cursor-container">
      <div className="text-cursor-inner">
        <AnimatePresence>
          {trail.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 1, rotate: item.angle }}
              animate={{
                opacity: 1,
                scale: 1,
                x: randomFloat ? [0, item.randomX ?? 0, 0] : 0,
                y: randomFloat ? [0, item.randomY ?? 0, 0] : 0,
                rotate: randomFloat
                  ? [item.angle, item.angle + (item.randomRotate ?? 0), item.angle]
                  : item.angle
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                opacity: { duration: exitDuration, ease: [0.4, 0, 0.2, 1] },
                ...(randomFloat && floatScale > 0 && {
                  x: {
                    duration: FLOAT_ANIMATION_DURATION,
                    ease: [0.4, 0, 0.2, 1],
                    repeat: Infinity,
                    repeatType: 'mirror'
                  },
                  y: {
                    duration: FLOAT_ANIMATION_DURATION,
                    ease: [0.4, 0, 0.2, 1],
                    repeat: Infinity,
                    repeatType: 'mirror'
                  },
                  rotate: {
                    duration: FLOAT_ANIMATION_DURATION,
                    ease: [0.4, 0, 0.2, 1],
                    repeat: Infinity,
                    repeatType: 'mirror'
                  }
                })
              }}
              className="text-cursor-item"
              style={{ left: item.x, top: item.y }}
            >
              {text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TextCursor
