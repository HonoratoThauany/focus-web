import { useEffect, useState } from "react"
import { auth } from "./firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import Login from "./login"

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Olá, {user.displayName}!</h1>
        <p className="text-slate-400 mt-2">Bem-vinda ao Focus Web</p>
      </div>
    </div>
  )
}