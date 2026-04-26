import { useEffect, useState } from "react"
import { fraseAleatoria } from "./FraseMotivacional"

type Props = {
  segundos: number
  emPausa: boolean
  onPausar: () => void
  onReiniciar: () => void
}

export default function ModoFoco({ segundos, emPausa, onPausar, onReiniciar }: Props) {
  const [frase, setFrase] = useState(fraseAleatoria())

  useEffect(() => {
    setFrase(fraseAleatoria())
  }, [emPausa])

  function formatar(s: number) {
    const min = Math.floor(s / 60).toString().padStart(2, "0")
    const seg = (s % 60).toString().padStart(2, "0")
    return `${min}:${seg}`
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-8 z-50 px-4">
      <p className="text-slate-500 text-sm uppercase tracking-widest">
        {emPausa ? "Pausa" : "Modo Foco"}
      </p>
      <p className="text-8xl md:text-9xl font-bold text-white tabular-nums">
        {formatar(segundos)}
      </p>
      <p className="text-slate-400 text-center text-lg max-w-md italic">
        "{frase}"
      </p>
      <div className="flex gap-4 mt-4">
        <button
          onClick={onPausar}
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3 rounded-xl transition"
        >
          Pausar
        </button>
        <button
          onClick={onReiniciar}
          className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition"
        >
          Sair do foco
        </button>
      </div>
    </div>
  )
}