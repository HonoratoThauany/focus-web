import { useState } from "react"
import { auth } from "./firebase"
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth"
import Logo from "./Logo"

type Modo = "login" | "cadastro" | "esqueci"

type Props = {
  onVisitante: () => void
}

export default function Login({ onVisitante }: Props) {
  const [modo, setModo] = useState<Modo>("login")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [carregando, setCarregando] = useState(false)

  function limpar() {
    setErro("")
    setSucesso("")
    setNome("")
    setEmail("")
    setSenha("")
  }

  function trocarModo(m: Modo) {
    limpar()
    setModo(m)
  }

  function traduzirErro(code: string) {
    const erros: Record<string, string> = {
      "auth/email-already-in-use": "Este e-mail já está cadastrado.",
      "auth/invalid-email": "E-mail inválido.",
      "auth/weak-password": "Senha muito fraca. Use ao menos 6 caracteres.",
      "auth/user-not-found": "Usuário não encontrado.",
      "auth/wrong-password": "Senha incorreta.",
      "auth/invalid-credential": "E-mail ou senha incorretos.",
      "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde."
    }
    return erros[code] || "Algo deu errado. Tente novamente."
  }

  async function handleGoogle() {
    setErro("")
    setCarregando(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (e: any) {
      setErro(traduzirErro(e.code))
    } finally {
      setCarregando(false)
    }
  }

  async function handleSubmit() {
    setErro("")
    setCarregando(true)
    try {
      if (modo === "cadastro") {
        if (!nome.trim()) { setErro("Digite seu nome."); setCarregando(false); return }
        const cred = await createUserWithEmailAndPassword(auth, email, senha)
        await updateProfile(cred.user, { displayName: nome })
        await cred.user.reload()
      } else if (modo === "login") {
        await signInWithEmailAndPassword(auth, email, senha)
      } else if (modo === "esqueci") {
        await sendPasswordResetEmail(auth, email)
        setSucesso("E-mail de recuperação enviado! Verifique sua caixa de entrada.")
      }
    } catch (e: any) {
      setErro(traduzirErro(e.code))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 max-w-sm w-full">

        {/* Logo */}
        <Logo size="lg" vertical />

        {/* Card */}
        <div className="w-full bg-white/3 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">

          {/* Abas */}
          {modo !== "esqueci" && (
            <div className="flex gap-1 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => trocarModo("login")}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  modo === "login"
                    ? "bg-violet-700 text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => trocarModo("cadastro")}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  modo === "cadastro"
                    ? "bg-violet-700 text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Criar conta
              </button>
            </div>
          )}

          {/* Título modo esqueci */}
          {modo === "esqueci" && (
            <div>
              <p className="text-white font-semibold text-sm">Recuperar senha</p>
              <p className="text-white/30 text-xs mt-1">Digite seu e-mail para receber o link de recuperação.</p>
            </div>
          )}

          {/* Campos */}
          <div className="flex flex-col gap-3">
            {modo === "cadastro" && (
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-white/5 border border-white/8 text-white text-sm rounded-xl px-4 py-2.5 outline-none placeholder-white/20 focus:border-violet-500/50 transition"
              />
            )}
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="bg-white/5 border border-white/8 text-white text-sm rounded-xl px-4 py-2.5 outline-none placeholder-white/20 focus:border-violet-500/50 transition"
            />
            {modo !== "esqueci" && (
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="bg-white/5 border border-white/8 text-white text-sm rounded-xl px-4 py-2.5 outline-none placeholder-white/20 focus:border-violet-500/50 transition"
              />
            )}
          </div>

          {/* Esqueci senha */}
          {modo === "login" && (
            <button
              onClick={() => trocarModo("esqueci")}
              className="text-white/20 hover:text-white/40 text-xs text-right transition"
            >
              Esqueci minha senha
            </button>
          )}

          {/* Erro / Sucesso */}
          {erro && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {erro}
            </p>
          )}
          {sucesso && (
            <p className="text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
              {sucesso}
            </p>
          )}

          {/* Botão principal */}
          <button
            onClick={handleSubmit}
            disabled={carregando}
            className="w-full bg-violet-700 hover:bg-violet-600 text-white font-medium py-2.5 rounded-xl transition-all duration-200 active:scale-95 text-sm disabled:opacity-50"
          >
            {carregando ? "Aguarde..." : modo === "login" ? "Entrar" : modo === "cadastro" ? "Criar conta" : "Enviar e-mail"}
          </button>

          {/* Voltar do esqueci */}
          {modo === "esqueci" && (
            <button
              onClick={() => trocarModo("login")}
              className="text-white/20 hover:text-white/40 text-xs text-center transition"
            >
              Voltar para o login
            </button>
          )}

          {/* Divisor Google */}
          {modo !== "esqueci" && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-white/20 text-xs">ou</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <button
                onClick={handleGoogle}
                disabled={carregando}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/8 text-white/60 hover:text-white/80 font-medium py-2.5 rounded-xl transition-all duration-200 active:scale-95 text-sm disabled:opacity-50"
              >
                Continuar com Google
              </button>
            </>
          )}

          {/* Divisor Visitante */}
          {modo !== "esqueci" && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-white/20 text-xs">ou</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <button
                onClick={onVisitante}
                className="w-full border border-white/8 hover:border-white/15 text-white/40 hover:text-white/70 font-medium py-2.5 rounded-xl transition-all duration-200 active:scale-95 text-sm group"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-base">👁</span>
                  Experimentar sem conta
                </span>
              </button>
              <p className="text-white/15 text-xs text-center -mt-1">
                Dados salvos apenas neste navegador
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}