import { auth } from "./firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"

export default function Login() {
  async function handleLogin() {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 max-w-sm w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <h1 className="text-white/90 text-2xl font-semibold tracking-tight">Focus Web</h1>
          <p className="text-white/30 text-sm text-center">
            Um espaço tranquilo para estudar com mais foco e disciplina
          </p>
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white/90 font-medium px-6 py-3 rounded-2xl transition-all duration-200 active:scale-95 text-sm"
        >
          Entrar com Google
        </button>
      </div>
    </div>
  )
}