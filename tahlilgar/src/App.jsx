import { useEffect, useState } from 'react'
import { Sidebar, Header } from './components/Shell'
import { IndexCard, PortfolioCard, PromoCard, VolumeCard, Watchlist } from './components/Cards'

export default function App() {
  const [dark, setDark] = useState(true)
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])
  return (
    <div className="mx-auto flex max-w-[1500px] gap-4 p-4">
      <Sidebar />
      <main className="min-w-0 flex-1 space-y-4">
        <Header dark={dark} setDark={setDark} />
        <div className="grid gap-4 lg:grid-cols-3">
          <IndexCard />
          <PortfolioCard />
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            <PromoCard />
            <VolumeCard />
          </div>
          <Watchlist />
        </div>
      </main>
    </div>
  )
}
