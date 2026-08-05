import AppRoutes from './routes.jsx'
import './App.css'

// A Home traz a própria top bar (voltar, título, opções), então não existe
// chrome global — cada página monta o seu.
export default function App() {
  return <AppRoutes />
}
