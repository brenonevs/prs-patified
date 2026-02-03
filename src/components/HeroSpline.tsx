'use client'

import { useRef, useEffect } from 'react'
import Spline from '@splinetool/react-spline'

const SPLINE_SCENE = 'https://prod.spline.design/T2hTnxm0Dn5QnXtP/scene.splinecode'

export function HeroSpline() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const onWheel = (e: WheelEvent) => {
            if (el.contains(e.target as Node)) {
                e.preventDefault()
                e.stopPropagation()
            }
        }
        document.addEventListener('wheel', onWheel, { passive: false, capture: true })
        return () => document.removeEventListener('wheel', onWheel, { capture: true })
    }, [])

    return (
        <div ref={containerRef} className="h-full w-full">
            <Spline
                scene={SPLINE_SCENE}
                className="!bg-transparent h-full w-full min-h-[420px]"
                style={{ width: '100%', height: '100%' }}
                onLoad={(spline) => {
                    spline.setBackgroundColor('transparent')
                    spline.setZoom(1.5)
                    const controls = spline.controls as Record<string, unknown> | undefined
                    if (controls) {
                        if (typeof controls.enableZoom === 'boolean') controls.enableZoom = false
                        if (typeof controls.enablePan === 'boolean') controls.enablePan = false
                        if (typeof controls.dollySpeed === 'number') controls.dollySpeed = 0
                        if (typeof controls.zoomSpeed === 'number') controls.zoomSpeed = 0
                        const dist = typeof controls.getDistance === 'function' ? (controls.getDistance as () => number)() : undefined
                        if (dist !== undefined && typeof controls.minDistance !== 'undefined') {
                            controls.minDistance = dist
                            controls.maxDistance = dist
                        }
                    }
                    const inner = (spline as { _controls?: Record<string, unknown> })._controls
                    if (inner) {
                        if (typeof inner.enableZoom === 'boolean') inner.enableZoom = false
                        if (typeof inner.enablePan === 'boolean') inner.enablePan = false
                        if (typeof inner.minDistance === 'number' && typeof inner.getDistance === 'function') {
                            const d = (inner.getDistance as () => number)()
                            inner.minDistance = d
                            inner.maxDistance = d
                        }
                    }
                }}
            />
        </div>
    )
}
