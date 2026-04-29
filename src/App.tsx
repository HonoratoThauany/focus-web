import { useEffect, useState } from "react"
import { auth } from "./firebase"
import { onAuthStateChanged, type User, signOut } from "firebase/auth"
import Login from "./login"
import Timer from "./Timer"
import TaskList from "./TaskList"
import Meta from "./Metas"
import Logo from "./Logo"

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/5">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          <p className="text-white/40 text-xs hidden sm:block">
            Olá, {user.displayName?.split(" ")[0]}
          </p>
          <button
            onClick={() => signOut(auth)}
            className="text-white/30 hover:text-white/60 text-xs transition-colors duration-200"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col xl:flex-row gap-8 px-6 md:px-10 py-10 max-w-6xl mx-auto w-full items-start">
        <div className="flex flex-col gap-6 w-full xl:w-[300px] shrink-0">
          <Timer />
          <div className="w-full h-px bg-white/5" />
          <Meta />
        </div>

        <div className="hidden xl:block w-px bg-white/5 self-stretch" />

        <div className="flex-1 w-full">
          <TaskList />
        </div>
      </main>
    </div>
  )
}