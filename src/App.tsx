import { useEffect, useState } from "react"
import { auth } from "./firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import { signOut } from "firebase/auth"
import Login from "./login"
import Timer from "./Timer"
import TaskList from "./TaskList"

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
      <header className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-slate-700">
        <h1 className="text-white font-bold text-lg md:text-xl">Focus Web</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <p className="text-slate-400 text-xs md:text-sm hidden sm:block">
            Olá, {user.displayName}
          </p>
          <button
            onClick={() => signOut(auth)}
            className="text-slate-400 hover:text-white text-sm transition"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col xl:flex-row gap-6 md:gap-8 px-4 md:px-8 py-6 md:py-8 items-start justify-center max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center gap-6 w-full xl:w-auto xl:min-w-[320px]">
          <Timer />
        </div>
        <div className="w-full xl:flex-1">
          <TaskList />
        </div>
      </main>
    </div>
  )
}