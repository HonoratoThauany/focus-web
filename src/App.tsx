import { useEffect, useState } from "react"
import { auth } from "./firebase"
import { onAuthStateChanged, type User, signOut } from "firebase/auth"
import Login from "./login"
import Timer from "./Timer"
import TaskList from "./TaskList"
import Meta from "./Metas"

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
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <h1 className="text-white/90 font-semibold text-base tracking-tight">Focus Web</h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-white/30 text-xs hidden sm:block">{user.displayName}</p>
          <button
            onClick={() => signOut(auth)}
            className="text-white/30 hover:text-white/60 text-xs transition-colors duration-200"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col xl:flex-row gap-6 px-6 md:px-10 py-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col gap-4 w-full xl:w-[280px] shrink-0">
          <Timer />
          <Meta />
        </div>

        <div className="hidden xl:block w-px bg-white/5 self-stretch" />

        <div className="flex-1">
          <TaskList />
        </div>
      </main>
    </div>
  )
}