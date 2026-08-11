import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home.jsx'
import Logo from './pages/Logo.jsx'
import Icone from './pages/Icone.jsx'
import PaletaDeCores from './pages/PaletaDeCores.jsx'
import Tipografia from './pages/Tipografia.jsx'
import TomDeVoz from './pages/TomDeVoz.jsx'
import Fotografia from './pages/Fotografia.jsx'
import Personalidade from './pages/Personalidade.jsx'
import Elementos from './pages/Elementos.jsx'
import PassoAPasso from './pages/PassoAPasso.jsx'

// Os temas válidos de /passo-a-passo/:tema vêm de src/data/pilares.js, que é
// a mesma lista usada pelos cards da Home.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/logo" element={<Logo />} />
      <Route path="/icone" element={<Icone />} />
      <Route path="/paleta-de-cores" element={<PaletaDeCores />} />
      <Route path="/tipografia" element={<Tipografia />} />
      <Route path="/tom-de-voz" element={<TomDeVoz />} />
      <Route path="/fotografia" element={<Fotografia />} />
      <Route path="/personalidade" element={<Personalidade />} />
      <Route path="/elementos" element={<Elementos />} />
      <Route path="/passo-a-passo" element={<PassoAPasso />} />
      <Route path="/passo-a-passo/:tema" element={<PassoAPasso />} />
      <Route path="*" element={<h1>404 — Página não encontrada</h1>} />
    </Routes>
  )
}
