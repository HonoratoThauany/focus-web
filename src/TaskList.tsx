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
  Média: "bg-yellow-500",
  Baixa: "bg-green-500"
}

export default function TaskList() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [titulo, setTitulo] = useState("")
  const [prioridade, setPrioridade] = useState<Prioridade>("Média")
  const [pomodoros, setPomodoros] = useState(1)
  const [categoria, setCategoria] = useState<Categoria>("Faculdade")

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
  }

  async function toggleConcluida(tarefa: Tarefa) {
    await updateDoc(doc(db, "tarefas", tarefa.id), {
      concluida: !tarefa.concluida
    })
  }

  async function deletarTarefa(id: string) {
    await deleteDoc(doc(db, "tarefas", id))
  }

  const pendentes = tarefas.filter((t) => !t.concluida)
  const concluidas = tarefas.filter((t) => t.concluida)

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-white font-bold text-xl">Tarefas do dia</h2>

      {/* Formulário */}
      <div className="bg-slate-800 rounded-2xl p-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="O que você precisa fazer?"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
          className="bg-slate-700 text-white rounded-xl px-4 py-2 outline-none placeholder-slate-400 w-full"
        />
        <div className="grid grid-cols-3 gap-2">
          <select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as Prioridade)}
            className="bg-slate-700 text-white rounded-xl px-3 py-2 outline-none text-sm"
          >
            <option>Alta</option>
            <option>Média</option>
            <option>Baixa</option>
          </select>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria)}
            className="bg-slate-700 text-white rounded-xl px-3 py-2 outline-none text-sm"
          >
            <option>Faculdade</option>
            <option>Trabalho</option>
            <option>Pessoal</option>
          </select>
          <select
            value={pomodoros}
            onChange={(e) => setPomodoros(Number(e.target.value))}
            className="bg-slate-700 text-white rounded-xl px-3 py-2 outline-none text-sm"
          >
            <option value={1}>🍅 1</option>
            <option value={2}>🍅 2</option>
            <option value={3}>🍅 3</option>
            <option value={4}>🍅 4</option>
          </select>
        </div>
        <button
          onClick={adicionarTarefa}
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2 rounded-xl transition"
        >
          Adicionar tarefa
        </button>
      </div>

      {/* Pendentes */}
      <div className="flex flex-col gap-2">
        {pendentes.length === 0 && concluidas.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">
            Nenhuma tarefa ainda. Adicione uma acima!
          </p>
        )}
        {pendentes.map((tarefa) => (
          <div
            key={tarefa.id}
            className="bg-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${prioridadeCor[tarefa.prioridade]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{tarefa.titulo}</p>
              <p className="text-slate-400 text-xs mt-1">
                {tarefa.categoria} · {"🍅".repeat(tarefa.pomodoros)}
              </p>
            </div>
            <button
              onClick={() => toggleConcluida(tarefa)}
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs px-3 py-1 rounded-lg transition font-medium shrink-0"
            >
              Concluir
            </button>
            <button
              onClick={() => deletarTarefa(tarefa.id)}
              className="text-slate-500 hover:text-red-400 text-xs transition shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Concluídas */}
      {concluidas.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            Concluídas ({concluidas.length})
          </p>
          {concluidas.map((tarefa) => (
            <div
              key={tarefa.id}
              className="bg-slate-800/50 rounded-2xl px-4 py-3 flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full shrink-0 bg-slate-600" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-500 text-sm truncate line-through">{tarefa.titulo}</p>
                <p className="text-slate-600 text-xs mt-1">
                  {tarefa.categoria} · {"🍅".repeat(tarefa.pomodoros)}
                </p>
              </div>
              <button
                onClick={() => toggleConcluida(tarefa)}
                className="bg-slate-700 text-slate-400 text-xs px-3 py-1 rounded-lg transition font-medium shrink-0"
              >
                Desfazer
              </button>
              <button
                onClick={() => deletarTarefa(tarefa.id)}
                className="text-slate-500 hover:text-red-400 text-xs transition shrink-0"
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