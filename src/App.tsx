import { useState } from 'react'
import HomeScreen from './screens/HomeScreen'
import Splash from './components/Splash'
import './App.css'

export default function App() {
  const [mostrarSplash, setMostrarSplash] = useState(true)

  return (
    <div className="app">
      {mostrarSplash && <Splash onConcluir={() => setMostrarSplash(false)} />}
      <main className="app__tela">
        <HomeScreen />
      </main>
    </div>
  )
}
