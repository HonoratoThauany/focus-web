import { useState, useEffect } from "react"
import { db } from "./firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { auth } from "./firebase"
import ModoFoco from "./ModoFoco"
import { tocarSomFim, tocarSomPausa } from "./Sons"

const POMODORO = 25 * 60
const PAUSA = 5 * 60

export default function Timer() {
  const [segundos, setSegundos] = useState(POMODORO)
  const [rodando, setRodando] = useState(false)
  const [emPausa, setEmPausa] = useState(false)
  const [sessoes, setSessoes] = useState(0)
  const [modoFoco, setModoFoco] = useState(false)

  useEffect(() => {
    if (!rodando) return

    const intervalo = setInterval(() => {
      setSegundos((s) => {
        if (s === 0) {
          setRodando(false)
          if (!emPausa) {
            salvarSessao()
            setSessoes((n) => n + 1)
            tocarSomFim()
          } else {
            tocarSomPausa()
          }
          setEmPausa((p) => !p)
          return emPausa ? POMODORO : PAUSA
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(intervalo)
  }, [rodando, emPausa])

  useEffect(() => {
    if (rodando) {
      document.title = `${formatar(segundos)} — Focus Web`
    } else {
      document.title = "Focus Web"
    }
  }, [segundos, rodando])

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

  function iniciar() {
    setRodando(true)
    setModoFoco(true)
  }

  function pausar() {
    setRodando(false)
    setModoFoco(false)
  }

  function retomar() {
    setRodando(true)
    setModoFoco(true)
  }

  function reiniciar() {
    setRodando(false)
    setEmPausa(false)
    setSegundos(POMODORO)
    setModoFoco(false)
  }

  return (
    <>
      {modoFoco && (
        <ModoFoco
          segundos={segundos}
          emPausa={emPausa}
          onPausar={pausar}
          onReiniciar={reiniciar}
        />
      )}
      <div className="flex flex-col gap-5 w-full items-center xl:items-start">
        <div className="flex flex-col gap-1">
          <p className="text-white/30 text-xs uppercase tracking-widest">
            {emPausa ? "Pausa" : "Foco"}
          </p>
          <p className="text-white text-7xl font-bold tabular-nums tracking-tight">
            {formatar(segundos)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={rodando ? pausar : segundos === (emPausa ? PAUSA : POMODORO) && !emPausa ? iniciar : retomar}
            className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-8 py-2.5 rounded-xl transition-all duration-200 active:scale-95 text-sm"
          >
            {rodando ? "Pausar" : "Iniciar"}
          </button>
          <button
            onClick={reiniciar}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all duration-200 active:scale-95 text-sm"
          >
            ↺
          </button>
        </div>

        <p className="text-white/20 text-xs">
          {sessoes} {sessoes === 1 ? "sessão" : "sessões"} hoje
        </p>
      </div>
    </>
  )
}