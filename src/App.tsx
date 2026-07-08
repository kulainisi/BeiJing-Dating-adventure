import { useState } from 'react'
import { GameState } from './engine/types'
import { PhoneFrame } from './components/PhoneFrame'
import { Home } from './pages/Home'
import { Game } from './pages/Game'
import { Gallery } from './pages/Gallery'

export type Page = { t: 'home' } | { t: 'game'; state: GameState } | { t: 'gallery' }

export default function App() {
  const [page, setPage] = useState<Page>({ t: 'home' })

  return (
    <PhoneFrame>
      {page.t === 'home' && (
        <Home
          onStart={(state) => setPage({ t: 'game', state })}
          onGallery={() => setPage({ t: 'gallery' })}
        />
      )}
      {page.t === 'game' && <Game initial={page.state} onExit={() => setPage({ t: 'home' })} />}
      {page.t === 'gallery' && <Gallery onBack={() => setPage({ t: 'home' })} />}
    </PhoneFrame>
  )
}
