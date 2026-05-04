import { useState, useEffect } from "react"
import { db } from "./firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { auth } from "./firebase"
import ModoFoco from "./ModoFoco"
import { tocarSomFim, tocarSomPausa } from "./Sons"

export default function Timer() {
  const [tempoFoco, setTempoFoco] = useState(25)
  const [tempoDescanso, setTempoDescanso] = useState(5)
  const [segundos, setSegundos] = useState(25 * 60)
  const [rodando, setRodando] = useState(false)
  const [emPausa, setEmPausa] = useState(false)
  const [sessoes, setSessoes] = useState(0)
  const [modoFoco, setModoFoco] = useState(false)
  const [focoTerminou, setFocoTerminou] = useState(false)
  const [configurando, setConfigurando] = useState(false)
  const [novoFoco, setNovoFoco] = useState(25)
  const [novoDescanso, setNovoDescanso] = useState(5)

  const POMODORO = tempoFoco * 60
  const PAUSA = tempoDescanso * 60

  useEffect(() => {
    if (!rodando) return
    const intervalo = setInterval(() => {
      setSegundos((s) => {
        if (s === 0) {
          setRodando(false)
          setModoFoco(false)
          if (!emPausa) {
            salvarSessao()
            setSessoes((n) => n + 1)
            tocarSomFim()
            setFocoTerminou(true)
          } else {
            tocarSomPausa()
            setEmPausa(false)
            setSegundos(POMODORO)
            setFocoTerminou(false)
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalo)
  }, [rodando, emPausa, POMODORO, PAUSA])

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
      duracaoMinutos: tempoFoco,
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
    setFocoTerminou(false)
  }

  function iniciarDescanso() {
    setEmPausa(true)
    setSegundos(PAUSA)
    setRodando(true)
    setModoFoco(true)
    setFocoTerminou(false)
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
    setFocoTerminou(false)
  }

  function salvarConfig() {
    setTempoFoco(novoFoco)
    setTempoDescanso(novoDescanso)
    setSegundos(novoFoco * 60)
    setRodando(false)
    setEmPausa(false)
    setModoFoco(false)
    setFocoTerminou(false)
    setConfigurando(false)
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

        {/* Label */}
        <div className="flex items-center justify-between w-full">
          <p className="text-white/30 text-xs uppercase tracking-widest">
            {emPausa ? "☕ Descanso" : focoTerminou ? "✅ Foco concluído" : "🎯 Foco"}
          </p>
        </div>

        {/* Configurações */}
        {configurando && (
          <div className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-white/60 text-xs font-medium">Personalizar tempos</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-white/30 text-xs">Foco (min)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={novoFoco}
                  onChange={(e) => setNovoFoco(Number(e.target.value))}
                  className="bg-slate-700/60 text-white rounded-xl px-3 py-2 outline-none text-sm w-full"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-white/30 text-xs">Descanso (min)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={novoDescanso}
                  onChange={(e) => setNovoDescanso(Number(e.target.value))}
                  className="bg-slate-700/60 text-white rounded-xl px-3 py-2 outline-none text-sm w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={salvarConfig}
                className="flex-1 bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold py-2 rounded-xl transition active:scale-95"
              >
                Salvar
              </button>
              <button
                onClick={() => setConfigurando(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-400 text-xs rounded-xl transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Timer */}
        <p className="text-white text-7xl font-bold tabular-nums tracking-tight">
          {formatar(segundos)}
        </p>

        {/* Botões */}
        {focoTerminou ? (
          <div className="flex flex-col gap-2 w-full">
            <p className="text-white/40 text-xs">Sessão de foco concluída! Quer descansar?</p>
            <div className="flex gap-2">
              <button
                onClick={iniciarDescanso}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-xl transition active:scale-95 text-sm"
              >
                Iniciar descanso ({tempoDescanso} min)
              </button>
              <button
                onClick={reiniciar}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition active:scale-95 text-sm"
              >
                ↺
              </button>
            </div>
          </div>
        ) : (
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
            <button
              onClick={() => { setConfigurando(!configurando); setNovoFoco(tempoFoco); setNovoDescanso(tempoDescanso) }}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all duration-200 active:scale-95 text-sm"
              title="Ajustar tempo"
            >
              ⚙
            </button>
          </div>
        )}

        {/* Sessões */}
        <p className="text-white/20 text-xs">
          {sessoes} {sessoes === 1 ? "sessão" : "sessões"} hoje · {tempoFoco} min foco / {tempoDescanso} min descanso
        </p>
      </div>
    </>
  )
}