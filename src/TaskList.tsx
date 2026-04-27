import { useState, useEffect } from "react"
import { db, auth } from "./firebase"
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore"

type Prioridade = "Alta" | "Média" | "Baixa"
type Categoria = "Faculdade" | "Trabalho" | "Pessoal"

type Tarefa = {
  id: string
  titulo: string
  prioridade: Prioridade
  pomodoros: number
  categoria: Categoria
  concluida: boolean
}

const prioridadeCor = {
  Alta: "bg-red-500",
  Média: "bg-amber-400",
  Baixa: "bg-emerald-500"
}

const prioridadeOrdem = { Alta: 0, Média: 1, Baixa: 2 }

export default function TaskList() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [titulo, setTitulo] = useState("")
  const [prioridade, setPrioridade] = useState<Prioridade>("Média")
  const [pomodoros, setPomodoros] = useState(1)
  const [categoria, setCategoria] = useState<Categoria>("Faculdade")
  const [adicionando, setAdicionando] = useState(false)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const q = query(
      collection(db, "tarefas"),
      where("userId", "==", user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Tarefa[]
      setTarefas(lista)
    })

    return unsubscribe
  }, [])

  async function adicionarTarefa() {
    if (!titulo.trim()) return
    const user = auth.currentUser
    if (!user) return

    setAdicionando(true)
    await addDoc(collection(db, "tarefas"), {
      userId: user.uid,
      titulo,
      prioridade,
      pomodoros,
      categoria,
      concluida: false,
      criadoEm: serverTimestamp()
    })

    setTitulo("")
    setPomodoros(1)
    setTimeout(() => setAdicionando(false), 300)
  }

  const [concluindoId, setConcluindoId] = useState<string | null>(null)

  async function toggleConcluida(tarefa: Tarefa) {
    if (!tarefa.concluida) {
      setConcluindoId(tarefa.id)
      setTimeout(async () => {
        await updateDoc(doc(db, "tarefas", tarefa.id), {
          concluida: !tarefa.concluida
        })
        setConcluindoId(null)
      }, 400)
    } else {
      await updateDoc(doc(db, "tarefas", tarefa.id), {
        concluida: false
      })
    }
}

  async function deletarTarefa(id: string) {
    await deleteDoc(doc(db, "tarefas", id))
  }

  const pendentes = tarefas
    .filter((t) => !t.concluida)
    .sort((a, b) => prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade])

  const concluidas = tarefas.filter((t) => t.concluida)

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-xl">Tarefas do dia</h2>
        {pendentes.length > 0 && (
          <span className="text-xs text-slate-500">
            {pendentes.length} pendente{pendentes.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Formulário */}
      <div className="bg-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 border border-slate-700/50">
        <input
          type="text"
          placeholder="O que você precisa fazer?"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
          className="bg-slate-700/60 text-white rounded-xl px-4 py-2.5 outline-none placeholder-slate-500 w-full text-sm focus:ring-1 focus:ring-violet-600 transition"
        />
        <div className="grid grid-cols-3 gap-2">
          <select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as Prioridade)}
            className="bg-slate-700/60 text-slate-300 rounded-xl px-3 py-2 outline-none text-xs"
          >
            <option>Alta</option>
            <option>Média</option>
            <option>Baixa</option>
          </select>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria)}
            className="bg-slate-700/60 text-slate-300 rounded-xl px-3 py-2 outline-none text-xs"
          >
            <option>Faculdade</option>
            <option>Trabalho</option>
            <option>Pessoal</option>
          </select>
          <select
            value={pomodoros}
            onChange={(e) => setPomodoros(Number(e.target.value))}
            className="bg-slate-700/60 text-slate-300 rounded-xl px-3 py-2 outline-none text-xs"
          >
            <option value={1}>🍅 1</option>
            <option value={2}>🍅 2</option>
            <option value={3}>🍅 3</option>
            <option value={4}>🍅 4</option>
          </select>
        </div>
        <button
          onClick={adicionarTarefa}
          disabled={!titulo.trim()}
          className={`font-semibold py-2.5 rounded-xl transition-all duration-200 active:scale-95 text-sm ${
            titulo.trim()
              ? "bg-violet-700 hover:bg-violet-600 text-white shadow-md shadow-violet-900/30"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
          }`}
        >
          {adicionando ? "Adicionando..." : "Adicionar tarefa"}
        </button>
      </div>

      {/* Pendentes */}
      <div className="flex flex-col gap-2">
        {pendentes.length === 0 && concluidas.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-600 text-sm">Nenhuma tarefa ainda</p>
            <p className="text-slate-700 text-xs mt-1">Adicione uma tarefa acima para começar</p>
          </div>
        )}
        {pendentes.map((tarefa) => (
          <div
            key={tarefa.id}
            className={`bg-slate-800/80 border border-slate-700/50 rounded-2xl px-4 py-3 flex items-center gap-3 hover:border-slate-600/50 transition-all duration-300 ${
              concluindoId === tarefa.id
                ? "opacity-0 scale-95 translate-x-4"
                : "opacity-100 scale-100 translate-x-0"
            }`}
          >
            <div className={`w-1.5 h-8 rounded-full shrink-0 ${prioridadeCor[tarefa.prioridade]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{tarefa.titulo}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-slate-500 text-xs">{tarefa.categoria}</span>
                <span className="text-slate-700 text-xs">·</span>
                <span className="text-slate-500 text-xs">{"🍅".repeat(tarefa.pomodoros)}</span>
              </div>
            </div>
            <button
              onClick={() => toggleConcluida(tarefa)}
              className="shrink-0 w-6 h-6 rounded-full border-2 border-slate-600 hover:border-violet-500 transition-all duration-200 flex items-center justify-center"
            >
              <span className="text-xs opacity-0 hover:opacity-100">✓</span>
            </button>
            <button
              onClick={() => deletarTarefa(tarefa.id)}
              className="text-slate-700 hover:text-red-400 text-xs transition shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Concluídas */}
      {concluidas.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-slate-600 text-xs font-medium uppercase tracking-wider">
            Concluídas · {concluidas.length}
          </p>
          {concluidas.map((tarefa) => (
            <div
              key={tarefa.id}
              className="bg-slate-800/40 rounded-2xl px-4 py-3 flex items-center gap-3 opacity-50 hover:opacity-70 transition-opacity duration-200"
            >
              <div className="w-1.5 h-8 rounded-full shrink-0 bg-slate-700" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-500 text-sm line-through truncate">{tarefa.titulo}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-slate-600 text-xs">{tarefa.categoria}</span>
                </div>
              </div>
              <button
                onClick={() => toggleConcluida(tarefa)}
                className="shrink-0 w-6 h-6 rounded-full bg-violet-700/50 flex items-center justify-center"
              >
                <span className="text-violet-300 text-xs">✓</span>
              </button>
              <button
                onClick={() => deletarTarefa(tarefa.id)}
                className="text-slate-700 hover:text-red-400 text-xs transition shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}