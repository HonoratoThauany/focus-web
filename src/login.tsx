import { auth } from "./firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"

export default function Login() {
    async function handleLogin() {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="bg-slate-800 p-10 rounded-2xl flex flex-col items-center gap-6">
                <h1 className="text-3xl font-bold text-white">Focus App</h1>
                <p className="text-slate-400">Organize seu foco e sua disciplina</p>
                <button
                    onClick={handleLogin}
                    className="bg-white text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-slate-100 transition"
                >
                    Entrar com Google
                </button>
            </div>
        </div>
    )
}