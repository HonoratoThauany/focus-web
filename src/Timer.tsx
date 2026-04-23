import { useState, useEffect } from "react"
import { db } from "./firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { auth } from "./firebase"

const POMODORO = 25 * 60
const PAUSA = 5 * 60

export default function Timer() {
  const [segundos, setSegundos] = useState(POMODORO)
  const [rodando, setRodando] = useState(false)
  const [emPausa, setEmPausa] = useState(false)
  const [sessoes, setSessoes] = useState(0)

  useEffect(() => {
    if (!rodando) return

    const intervalo = setInterval(() => {
      setSegundos((s) => {
        if (s === 0) {
          setRodando(false)
          if (!emPausa) {
            salvarSessao()
            setSessoes((n) => n + 1)
          }
          setEmPausa((p) => !p)
          return emPausa ? POMODORO : PAUSA
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(intervalo)
  }, [rodando, emPausa])

  async function salvarSessao() {
    const user = auth.currentUser
    if (!user) return

    await addDoc(collection(db, "sessoes"), {
      userId: user.uid,
      duracaoMinutos: 25,
      criadoEm: serverTimestamp()
    })
  }

  function formatar(s: number) {
    const min = Math.floor(s / 60).toString().padStart(2, "0")
    const seg = (s % 60).toString().padStart(2, "0")
    return `${min}:${seg}`
  }

  function reiniciar() {
    setRodando(false)
    setEmPausa(false)
    setSegundos(POMODORO)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-slate-400 text-lg">
        {emPausa ? "Pausa" : "Foco"}
      </p>
      <p className="text-8xl font-bold text-white tabular-nums">
        {formatar(segundos)}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => setRodando((r) => !r)}
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3 rounded-xl transition"
        >
          {rodando ? "Pausar" : "Iniciar"}
        </button>
        <button
          onClick={reiniciar}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-3 rounded-xl transition"
        >
          Reiniciar
        </button>
      </div>
      <p className="text-slate-400 text-sm">
        Sessões hoje: <span className="text-white font-bold">{sessoes}</span>
      </p>
    </div>
  )
}