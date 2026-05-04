import { useState, useEffect } from "react"
import { db, auth } from "./firebase"
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore"

export default function Meta() {
  const [meta, setMeta] = useState(4)
  const [sessoesHoje, setSessoesHoje] = useState(0)
  const [editando, setEditando] = useState(false)
  const [novaMeta, setNovaMeta] = useState(4)
  const [comemorando, setComemorando] = useState(false)

  useEffect(() => {
    carregarMeta()
    carregarSessoesHoje()
  }, [])

  useEffect(() => {
    if (sessoesHoje > 0 && sessoesHoje >= meta) {
      setComemorando(true)
      setTimeout(() => setComemorando(false), 3000)
    }
  }, [sessoesHoje, meta])

  async function carregarMeta() {
    const user = auth.currentUser
    if (!user) return
    const ref = doc(db, "metas", user.uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      setMeta(snap.data().sessoesporDia)
      setNovaMeta(snap.data().sessoesporDia)
    }
  }

  async function carregarSessoesHoje() {
    const user = auth.currentUser
    if (!user) return
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const q = query(
      collection(db, "sessoes"),
      where("userId", "==", user.uid)
    )
    const snap = await getDocs(q)
    const sessoesDeHoje = snap.docs.filter((doc) => {
      const data = doc.data().criadoEm?.toDate()
      return data && data >= hoje
    })
    setSessoesHoje(sessoesDeHoje.length)
  }

  async function salvarMeta() {
    const user = auth.currentUser
    if (!user) return
    await setDoc(doc(db, "metas", user.uid), {
      sessoesporDia: novaMeta
    })
    setMeta(novaMeta)
    setEditando(false)
  }

  const progresso = Math.min((sessoesHoje / meta) * 100, 100)
  const concluiu = sessoesHoje >= meta

  return (
    <div className={`w-full rounded-2xl p-4 flex flex-col gap-3 transition-all duration-500 ${
      comemorando
        ? "bg-green-900/40 ring-1 ring-green-500/50"
        : "bg-slate-800"
    }`}>
      <div className="flex items-center justify-between">
        <p className="text-white font-semibold text-sm">
          {comemorando ? "🎉 Meta atingida!" : "Meta do dia"}
        </p>
        <button
          onClick={() => setEditando((e) => !e)}
          className="text-slate-500 hover:text-slate-300 text-xs transition"
        >
          {editando ? "Cancelar" : "Editar"}
        </button>
      </div>

      {editando ? (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={1}
            max={12}
            value={novaMeta}
            onChange={(e) => setNovaMeta(Number(e.target.value))}
            className="bg-slate-700 text-white rounded-xl px-3 py-2 w-16 outline-none text-sm"
          />
          <span className="text-slate-400 text-sm">ciclos por dia</span>
          <button
            onClick={salvarMeta}
            className="bg-violet-700 hover:bg-violet-600 text-white text-sm px-4 py-2 rounded-xl transition active:scale-95 ml-auto"
          >
            Salvar
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-end justify-between">
            <p className="text-slate-400 text-sm">
              <span className={`font-bold text-2xl transition-all duration-300 ${concluiu ? "text-green-400" : "text-white"}`}>
                {sessoesHoje}
              </span>
              {" "}/{" "}{meta} ciclos
            </p>
          </div>

          {/* Barra de progresso */}
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ease-out ${
                concluiu ? "bg-green-500" : "bg-violet-600"
              }`}
              style={{ width: `${progresso}%` }}
            />
          </div>

          {/* Bolinhas de sessão */}
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: meta }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i < sessoesHoje
                    ? "bg-violet-500 scale-110"
                    : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}