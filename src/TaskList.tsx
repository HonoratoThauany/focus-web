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
type Categoria = string

type Tarefa = {
  id: string
  titulo: string
  prioridade: Prioridade
  categoria: Categoria
  concluida: boolean
}

const prioridadeCor = {
  Alta: "bg-red-500",
  Média: "bg-amber-400",
  Baixa: "bg-emerald-500"
}

const prioridadeOrdem = { Alta: 0, Média: 1, Baixa: 2 }

const CATEGORIAS_PADRAO = ["Estudos", "Trabalho", "Pessoal"]

type Props = {
  isVisitante?: boolean
}

export default function TaskList({ isVisitante = false }: Props) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [titulo, setTitulo] = useState("")
  const [prioridade, setPrioridade] = useState<Prioridade>("Média")
  const [categoria, setCategoria] = useState<Categoria>("Estudos")
  const [adicionando, setAdicionando] = useState(false)
  const [concluindoId, setConcluindoId] = useState<string | null>(null)
  const [abrirPrioridade, setAbrirPrioridade] = useState(false)
  const [abrirCategoria, setAbrirCategoria] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editTitulo, setEditTitulo] = useState("")
  const [editPrioridade, setEditPrioridade] = useState<Prioridade>("Média")
  const [editCategoria, setEditCategoria] = useState<Categoria>("Estudos")
  const [abrirEditPrioridade, setAbrirEditPrioridade] = useState(false)
  const [abrirEditCategoria, setAbrirEditCategoria] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState("")
  const [adicionandoCategoria, setAdicionandoCategoria] = useState(false)
  const [categoriasExtras, setCategoriasExtras] = useState<string[]>(() => {
    const salvas = localStorage.getItem("categorias_extras")
    return salvas ? JSON.parse(salvas) : []
  })

  const todasCategorias = [...CATEGORIAS_PADRAO, ...categoriasExtras]

  // ─── Helpers para localStorage do visitante ───
  function carregarTarefasLocal(): Tarefa[] {
    const salvas = localStorage.getItem("visitante_tarefas")
    return salvas ? JSON.parse(salvas) : []
  }

  function salvarTarefasLocal(lista: Tarefa[]) {
    localStorage.setItem("visitante_tarefas", JSON.stringify(lista))
  }

  // ─── Carregar tarefas ───
  useEffect(() => {
    if (isVisitante) {
      setTarefas(carregarTarefasLocal())
      return
    }

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
  }, [isVisitante])

  useEffect(() => {
    function fecharDropdowns(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest(".dropdown-container")) {
        setAbrirPrioridade(false)
        setAbrirCategoria(false)
        setAbrirEditPrioridade(false)
        setAbrirEditCategoria(false)
        setAdicionandoCategoria(false)
        setNovaCategoria("")
      }
    }

    document.addEventListener("mousedown", fecharDropdowns)
    return () => document.removeEventListener("mousedown", fecharDropdowns)
  }, [])

  function adicionarCategoria() {
    if (!novaCategoria.trim()) return
    const nova = novaCategoria.trim()
    if (todasCategorias.includes(nova)) return

    const novas = [...categoriasExtras, nova]
    setCategoriasExtras(novas)
    localStorage.setItem("categorias_extras", JSON.stringify(novas))
    setCategoria(nova)
    setNovaCategoria("")
    setAdicionandoCategoria(false)
    setAbrirCategoria(false)
  }

  function removerCategoriaExtra(cat: string) {
    const novas = categoriasExtras.filter((c) => c !== cat)
    setCategoriasExtras(novas)
    localStorage.setItem("categorias_extras", JSON.stringify(novas))
    if (categoria === cat) setCategoria("Estudos")
  }

  async function adicionarTarefa() {
    if (!titulo.trim()) return

    if (isVisitante) {
      const novaTarefa: Tarefa = {
        id: crypto.randomUUID(),
        titulo,
        prioridade,
        categoria,
        concluida: false
      }
      const novaLista = [...tarefas, novaTarefa]
      setTarefas(novaLista)
      salvarTarefasLocal(novaLista)
      setTitulo("")
      return
    }

    const user = auth.currentUser
    if (!user) return

    setAdicionando(true)
    await addDoc(collection(db, "tarefas"), {
      userId: user.uid,
      titulo,
      prioridade,
      categoria,
      concluida: false,
      criadoEm: serverTimestamp()
    })

    setTitulo("")
    setTimeout(() => setAdicionando(false), 300)
  }

  function abrirEdicao(tarefa: Tarefa) {
    setEditandoId(tarefa.id)
    setEditTitulo(tarefa.titulo)
    setEditPrioridade(tarefa.prioridade)
    setEditCategoria(tarefa.categoria)
  }

  async function salvarEdicao(id: string) {
    if (!editTitulo.trim()) return

    if (isVisitante) {
      const novaLista = tarefas.map((t) =>
        t.id === id
          ? { ...t, titulo: editTitulo, prioridade: editPrioridade, categoria: editCategoria }
          : t
      )
      setTarefas(novaLista)
      salvarTarefasLocal(novaLista)
      setEditandoId(null)
      return
    }

    await updateDoc(doc(db, "tarefas", id), {
      titulo: editTitulo,
      prioridade: editPrioridade,
      categoria: editCategoria
    })
    setEditandoId(null)
  }

  async function toggleConcluida(tarefa: Tarefa) {
    if (isVisitante) {
      if (!tarefa.concluida) {
        setConcluindoId(tarefa.id)
        setTimeout(() => {
          const novaLista = tarefas.map((t) =>
            t.id === tarefa.id ? { ...t, concluida: true } : t
          )
          setTarefas(novaLista)
          salvarTarefasLocal(novaLista)
          setConcluindoId(null)
        }, 400)
      } else {
        const novaLista = tarefas.map((t) =>
          t.id === tarefa.id ? { ...t, concluida: false } : t
        )
        setTarefas(novaLista)
        salvarTarefasLocal(novaLista)
      }
      return
    }

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
    if (isVisitante) {
      const novaLista = tarefas.filter((t) => t.id !== id)
      setTarefas(novaLista)
      salvarTarefasLocal(novaLista)
      return
    }

    await deleteDoc(doc(db, "tarefas", id))
  }

  const pendentes = tarefas
    .filter((t) => !t.concluida)
    .sort((a, b) => prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade])

  const concluidas = tarefas.filter((t) => t.concluida)

  function DropdownCategoria({
    valor,
    onChange,
    aberto,
    setAberto,
    mostrarAdicionar = false
  }: {
    valor: Categoria
    onChange: (c: Categoria) => void
    aberto: boolean
    setAberto: (v: boolean) => void
    mostrarAdicionar?: boolean
  }) {
    return (
      <div className="relative dropdown-container">
        <button
          onClick={() => setAberto(!aberto)}
          className="w-full bg-slate-700/60 text-slate-300 rounded-xl px-3 py-2 outline-none text-xs flex items-center justify-between"
        >
          {valor}
          <span className="text-slate-500">▾</span>
        </button>
        {aberto && (
          <div className="absolute top-full mt-1 left-0 w-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10 shadow-lg">
            {todasCategorias.map((c) => (
              <div key={c} className="flex items-center group">
                <button
                  onClick={() => { onChange(c); setAberto(false) }}
                  className={`flex-1 px-3 py-2 text-xs text-left hover:bg-slate-700 transition ${valor === c ? "text-white" : "text-slate-400"}`}
                >
                  {c}
                </button>
                {categoriasExtras.includes(c) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removerCategoriaExtra(c) }}
                    className="pr-3 text-slate-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {mostrarAdicionar && (
              <div className="border-t border-slate-700">
                {adicionandoCategoria ? (
                  <div className="flex gap-1 p-2">
                    <input
                      autoFocus
                      type="text"
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && adicionarCategoria()}
                      placeholder="Nome da categoria"
                      className="flex-1 bg-slate-700 text-white text-xs px-2 py-1.5 rounded-lg outline-none placeholder-slate-500"
                    />
                    <button
                      onClick={adicionarCategoria}
                      className="bg-violet-700 hover:bg-violet-600 text-white text-xs px-2 py-1.5 rounded-lg transition"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAdicionandoCategoria(true)}
                    className="w-full px-3 py-2 text-xs text-left text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition"
                  >
                    + Nova categoria
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

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
          placeholder="O que você precisa fazer hoje?"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
          className="bg-slate-700/60 text-white rounded-xl px-4 py-2.5 outline-none placeholder-slate-500 w-full text-sm focus:ring-1 focus:ring-violet-600 transition"
        />

        <div className="grid grid-cols-2 gap-2">
          {/* Prioridade */}
          <div className="flex flex-col gap-1">
            <label className="text-white/30 text-xs px-1">Prioridade</label>
            <div className="relative dropdown-container">
              <button
                onClick={() => { setAbrirPrioridade(!abrirPrioridade); setAbrirCategoria(false) }}
                title="Alta = urgente e importante · Média = importante · Baixa = pode esperar"
                className="w-full bg-slate-700/60 text-slate-300 rounded-xl px-3 py-2 outline-none text-xs flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${prioridadeCor[prioridade]}`} />
                  {prioridade}
                </span>
                <span className="text-slate-500">▾</span>
              </button>
              {abrirPrioridade && (
                <div className="absolute top-full mt-1 left-0 w-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10 shadow-lg">
                  {(["Alta", "Média", "Baixa"] as Prioridade[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPrioridade(p); setAbrirPrioridade(false) }}
                      className={`w-full px-3 py-2 text-xs text-left flex items-center gap-1.5 hover:bg-slate-700 transition ${prioridade === p ? "text-white" : "text-slate-400"}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${prioridadeCor[p]}`} />
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-1">
            <label className="text-white/30 text-xs px-1">Categoria</label>
            <DropdownCategoria
              valor={categoria}
              onChange={setCategoria}
              aberto={abrirCategoria}
              setAberto={(v) => { setAbrirCategoria(v); if (v) setAbrirPrioridade(false) }}
              mostrarAdicionar
            />
          </div>
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
          <div key={tarefa.id}>
            {editandoId === tarefa.id ? (
              <div className="bg-slate-800 border border-violet-500/50 rounded-2xl px-4 py-3 flex flex-col gap-3">
                <input
                  type="text"
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && salvarEdicao(tarefa.id)}
                  autoFocus
                  className="bg-slate-700/60 text-white rounded-xl px-4 py-2 outline-none text-sm focus:ring-1 focus:ring-violet-600 transition w-full"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-white/30 text-xs px-1">Prioridade</label>
                    <div className="relative dropdown-container">
                      <button
                        onClick={() => { setAbrirEditPrioridade(!abrirEditPrioridade); setAbrirEditCategoria(false) }}
                        title="Alta = urgente e importante · Média = importante · Baixa = pode esperar"
                        className="w-full bg-slate-700/60 text-slate-300 rounded-xl px-3 py-2 outline-none text-xs flex items-center justify-between"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${prioridadeCor[editPrioridade]}`} />
                          {editPrioridade}
                        </span>
                        <span className="text-slate-500">▾</span>
                      </button>
                      {abrirEditPrioridade && (
                        <div className="absolute top-full mt-1 left-0 w-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10 shadow-lg">
                          {(["Alta", "Média", "Baixa"] as Prioridade[]).map((p) => (
                            <button
                              key={p}
                              onClick={() => { setEditPrioridade(p); setAbrirEditPrioridade(false) }}
                              className={`w-full px-3 py-2 text-xs text-left flex items-center gap-1.5 hover:bg-slate-700 transition ${editPrioridade === p ? "text-white" : "text-slate-400"}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${prioridadeCor[p]}`} />
                              {p}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-white/30 text-xs px-1">Categoria</label>
                    <DropdownCategoria
                      valor={editCategoria}
                      onChange={setEditCategoria
                      }
                      aberto={abrirEditCategoria}
                      setAberto={(v) => { setAbrirEditCategoria(v); if (v) setAbrirEditPrioridade(false) }}
                      mostrarAdicionar
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => salvarEdicao(tarefa.id)}
                    className="flex-1 bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold py-2 rounded-xl transition active:scale-95"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditandoId(null)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-400 text-xs rounded-xl transition active:scale-95"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`bg-slate-800/80 border border-slate-700/50 rounded-2xl px-4 py-3 flex items-center gap-3 hover:border-slate-600/50 transition-all duration-300 ${
                  concluindoId === tarefa.id
                    ? "opacity-0 scale-95 translate-x-4"
                    : "opacity-100 scale-100 translate-x-0"
                }`}
              >
                <div className={`w-1.5 h-8 rounded-full shrink-0 ${prioridadeCor[tarefa.prioridade]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{tarefa.titulo}</p>
                  <span className="text-slate-500 text-xs">{tarefa.categoria}</span>
                </div>
                <button
                  onClick={() => abrirEdicao(tarefa)}
                  className="text-slate-600 hover:text-slate-300 text-xs transition shrink-0"
                >
                  ✎
                </button>
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
            )}
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
                <span className="text-slate-600 text-xs">{tarefa.categoria}</span>
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