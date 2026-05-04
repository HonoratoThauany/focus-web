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
  const [visitante, setVisitante] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) setVisitante(false)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  function entrarComoVisitante() {
    setVisitante(true)
  }

  function sairVisitante() {
    setVisitante(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user && !visitante) {
    return <Login onVisitante={entrarComoVisitante} />
  }

  const isVisitante = visitante && !user

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/5">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          {isVisitante ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-amber-400/70 text-xs">Modo visitante</p>
              </div>
              <button
                onClick={() => { sairVisitante() }}
                className="bg-violet-700 hover:bg-violet-600 text-white text-xs font-medium px-4 py-1.5 rounded-xl transition active:scale-95">
                Criar conta
              </button>
            </>
          ) : (
            <>
              <p className="text-white/40 text-xs hidden sm:block">
                Olá, {user?.displayName?.split(" ")[0]}
              </p>
              <button
                onClick={() => signOut(auth)}
                className="text-white/30 hover:text-white/60 text-xs transition-colors duration-200"
              >
                Sair
              </button>
            </>
          )}
        </div>
      </header>

      {/* Banner visitante */}
      {isVisitante && (
        <div className="bg-amber-500/5 border-b border-amber-500/10 px-6 md:px-10 py-2.5 flex items-center justify-center gap-2">
          <span className="text-amber-400/60 text-xs">⚠</span>
          <p className="text-amber-400/50 text-xs">
            Seus dados estão salvos apenas neste navegador.{" "}
            <button
              onClick={() => sairVisitante()}
              className="text-amber-400/80 hover:text-amber-400 underline underline-offset-2 transition"
            >
              Crie uma conta
            </button>
            {" "}para não perder seu progresso.
          </p>
        </div>
      )}

      <main className="flex-1 flex flex-col xl:flex-row gap-8 px-6 md:px-10 py-10 max-w-6xl mx-auto w-full items-start">
        <div className="flex flex-col gap-6 w-full xl:w-[300px] shrink-0">
          <Timer isVisitante={isVisitante} />
          <div className="w-full h-px bg-white/5" />
          <Meta isVisitante={isVisitante} />
        </div>

        <div className="hidden xl:block w-px bg-white/5 self-stretch" />

        

        <div className="flex-1 w-full">
          <TaskList isVisitante={isVisitante} />
        </div>
      </main>
    </div>
  )
}