import { useEffect, useState } from 'react'
import AppPanel from './components/AppPanel'
import SitePanel from './components/SitePanel'
import { SYMBOLS } from './data/market'

export default function App() {
  const [dark, setDark] = useState(true)
  const [sym, setSym] = useState(SYMBOLS[0])
  const [tab, setTab] = useState('watch')
  const [orders, setOrders] = useState([])
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])
  return (
    <div className="flex flex-col gap-[3px] bg-bg lg:h-full lg:flex-row">
      <AppPanel sym={sym} setSym={setSym} tab={tab} setTab={setTab} orders={orders} addOrder={(o) => setOrders([o, ...orders])} />
      <SitePanel sym={sym} dark={dark} setDark={setDark} openOrder={() => setTab('order')} />
    </div>
  )
}
