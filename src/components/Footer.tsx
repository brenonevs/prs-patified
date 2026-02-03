'use client'

import { GiDuck, GiGamepad, GiJoystick, GiTrophy, GiRetroController } from 'react-icons/gi'
import LogoLoop from '@/components/ui/LogoLoop'

const techLogos = [
  { node: <GiDuck />, title: 'Pato', href: '#' },
  { node: <GiGamepad />, title: 'Gamepad', href: '#' },
  { node: <GiJoystick />, title: 'Joystick', href: '#' },
  { node: <GiTrophy />, title: 'Troféu', href: '#' },
  { node: <GiRetroController />, title: 'Controle retrô', href: '#' }
]

export function Footer() {
  return (
    <footer className="absolute inset-x-0 bottom-0 z-10 py-8" aria-label="Ícones de pato e videogame">
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
            ariaLabel="Ícones de pato e videogame"
            className="[&_.logoloop__node]:text-current"
          />
        </div>
      </div>
    </footer>
  )
}
