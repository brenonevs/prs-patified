'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie, { type LottieRef } from 'lottie-react'

export function HeroLottieArrow() {
    const [animationData, setAnimationData] = useState<object | null>(null)
    const lottieRef: LottieRef = useRef(null)

    useEffect(() => {
        fetch('/animations/arrow-arc.json')
            .then((res) => res.json())
            .then(setAnimationData)
    }, [])

    if (!animationData) return null

    return (
        <div
            className="flex shrink-0 items-center justify-center mr-8 max-md:py-4 max-md:mr-4"
            style={{
                width: 300,
                height: 300,
                transform: 'rotate(-15deg)',
                filter: 'grayscale(1) brightness(3) contrast(0.7)'
            }}
            aria-hidden
        >
            <Lottie
                animationData={animationData}
                loop
                lottieRef={lottieRef}
                onDOMLoaded={() => lottieRef.current?.setSpeed(0.45)}
                style={{ width: 340, height: 340 }}
            />
        </div>
    )
}
