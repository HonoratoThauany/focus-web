import { useEffect, useState } from "react"
import { auth } from "./firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { signOut } from "firebase/auth"
import Login from "./login"
import Timer from "./Timer"

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
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-700">
        <h1 className="text-white font-bold text-xl">Focus App</h1>
        <div className="flex items-center gap-4">
          <p className="text-slate-400 text-sm">Olá, {user.displayName}</p>
          <button
            onClick={() => signOut(auth)}
            className="text-slate-400 hover:text-white text-sm transition"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <Timer />
      </main>
    </div>
  )
}