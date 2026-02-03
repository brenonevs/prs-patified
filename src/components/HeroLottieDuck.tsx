'use client'

import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'

export function HeroLottieDuck() {
    const [animationData, setAnimationData] = useState<object | null>(null)

    useEffect(() => {
        fetch('/animations/pixel-duck.json')
            .then((res) => res.json())
            .then(setAnimationData)
    }, [])

    if (!animationData) return null

    return (
        <div className="h-full w-full flex items-center justify-center" aria-hidden>
            <Lottie
                animationData={animationData}
                loop
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    )
}
