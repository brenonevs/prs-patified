'use client'

import { SiReact, SiNextdotjs, SiTypescript } from 'react-icons/si'
import LogoLoop from '@/components/ui/LogoLoop'

const techLogos = [
  { node: <SiReact />, title: 'React', href: 'https://react.dev' },
  { node: <SiNextdotjs />, title: 'Next.js', href: 'https://nextjs.org' },
  { node: <SiTypescript />, title: 'TypeScript', href: 'https://www.typescriptlang.org' }
]

export function Footer() {
  return (
    <footer className="absolute inset-x-0 bottom-0 z-10 py-8" aria-label="Tecnologias utilizadas">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
        <div className="relative overflow-hidden text-white/70" style={{ height: '80px' }}>
          <LogoLoop
            logos={techLogos}
            speed={80}
            direction="left"
            logoHeight={36}
            gap={48}
            hoverSpeed={0}
            scaleOnHover
            ariaLabel="Tecnologias utilizadas"
            className="[&_.logoloop__node]:text-current"
          />
        </div>
      </div>
    </footer>
  )
}
