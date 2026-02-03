import React from 'react'
import Link from 'next/link'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { HeroHeader } from './header'
import { HeroLottieDuck } from './HeroLottieDuck'
import PixelSnow from './PixelSnow'
import TextCursor from './TextCursor'
import TextType from './TextType'
import { HeroLottieArrow } from './HeroLottieArrow'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Footer } from './Footer'

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section className="min-h-screen bg-[#020408]">
                    <div className="relative min-h-screen py-40">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-[1] bg-blue-950/55"
                        />
                        <div className="mask-radial-from-45% mask-radial-to-75% mask-radial-at-top mask-radial-[75%_100%] aspect-2/3 absolute inset-0 z-0 opacity-10 blur-xl md:aspect-square lg:aspect-video dark:opacity-5">
                            <Image
                                src="https://images.unsplash.com/photo-1685013640715-8701bbaa2207?q=80&w=2198&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="hero background"
                                width={2198}
                                height={1685}
                                className="h-full w-full object-cover object-top"
                            />
                        </div>
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-[2]"
                        >
                            <TextCursor
                                text="🐤"
                                spacing={160}
                                followMouseDirection
                                randomFloat
                                floatAmount={0.25}
                                exitDuration={0.6}
                                removalInterval={35}
                                maxPoints={6}
                            />
                        </div>
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-[1]"
                        >
                            <PixelSnow
                                color="#ffffff"
                                flakeSize={0.005}
                                minFlakeSize={1.25}
                                pixelResolution={1024}
                                speed={1.25}
                                density={0.4}
                                direction={125}
                                brightness={1}
                                depthFade={8}
                                farPlane={20}
                                gamma={0.4545}
                                variant="square"
                            />
                        </div>
                        <div className="relative z-10 mx-auto w-full max-w-[90rem] px-4 sm:pl-6">
                            <div className="flex items-center justify-between max-md:flex-col gap-4 md:gap-6">
                                <div className="w-full max-w-6xl min-w-0 shrink md:min-w-[32rem] lg:min-w-[40rem] max-sm:px-2">
                                    <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Prove que seu amigo é um patinho. QUACK QUACK!</h1>
                                    <TextType
                                        as="p"
                                        text={[
                                            'Registre vitórias e deixe claro quem virou pato.',
                                            'Zoe os amigos quando eles levarem a pior.',
                                            'Quem ganhou na moral? Quem virou pato? Você registra.',
                                            'Patifique o amigo que perdeu e comemore a zoeira.'
                                        ]}
                                        className="block w-full min-h-[1.5em] text-xl text-muted-foreground mt-4 text-balance"
                                        typingSpeed={120}
                                        pauseDuration={2000}
                                        showCursor
                                        cursorCharacter="|"
                                        deletingSpeed={80}
                                        cursorBlinkDuration={0.5}
                                    />
                                </div>
                                <HeroLottieArrow />
                                <div
                                    className="spline-hero relative -mt-16 h-[520px] w-full max-w-3xl bg-transparent max-md:mx-auto max-md:h-[420px] max-md:-mt-10"
                                    style={{ background: 'transparent' }}
                                >
                                    <HeroLottieDuck />
                                </div>
                            </div>
                            <div className="relative z-10 flex w-full justify-center pt-8 pb-4">
                                <ShimmerButton asChild className="shadow-2xl" shimmerSize="2px" shimmerColor="rgba(255,255,255,0.9)" background="rgba(38, 38, 38, 1)">
                                    <Link href="/login">
                                        <span className="text-center text-sm font-medium leading-none tracking-tight text-white whitespace-nowrap lg:text-lg dark:from-white dark:to-slate-900/10">
                                            Começar
                                        </span>
                                        <ChevronRight className="size-4 opacity-50" />
                                    </Link>
                                </ShimmerButton>
                            </div>
                        </div>
                        <Footer />
                    </div>
                </section>
            </main>
        </>
    )
}
