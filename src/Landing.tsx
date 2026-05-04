import Logo from "./Logo"

type Props = {
  onLogin: () => void
}

export default function Landing({ onLogin }: Props) {
  const tarefas = [
    { id: 1, titulo: "Estudar para a prova", cat: "Estudos", cor: "bg-red-500" },
    { id: 2, titulo: "Entregar trabalho", cat: "Trabalho", cor: "bg-amber-400" },
    { id: 3, titulo: "Ler 20 páginas", cat: "Pessoal", cor: "bg-emerald-500" },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/5">
        <Logo size="sm" />
        <button
          onClick={onLogin}
          className="bg-violet-700 hover:bg-violet-600 text-white text-xs font-medium px-4 py-2 rounded-xl transition active:scale-95"
        >
          Entrar
        </button>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-10 gap-5">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span className="text-violet-300 text-xs">Feito para quem tem TDAH e dificuldade de foco</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight max-w-2xl">
          Estude com mais<br />
          <span className="text-violet-400">foco e disciplina</span>
        </h1>
        <p className="text-white/40 text-sm md:text-base max-w-md leading-relaxed">
          Um espaço tranquilo com timer Pomodoro, lista de tarefas e metas diárias para te ajudar a manter o ritmo.
        </p>
        <button
          onClick={onLogin}
          className="bg-violet-700 hover:bg-violet-600 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-200 active:scale-95 text-sm shadow-lg shadow-violet-900/30"
        >
          Criar conta grátis
        </button>
      </section>

      {/* App demo */}
      <section className="px-6 md:px-10 pb-20 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">

          {/* Coluna esquerda — Timer + Meta */}
          <div className="flex flex-col gap-4">
            {/* Timer */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
              <p className="text-white/30 text-xs uppercase tracking-widest">🎯 Foco</p>
              <p className="text-white text-7xl font-bold tabular-nums tracking-tight leading-none">
                25:00
              </p>
              <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-violet-500 rounded-full" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onLogin}
                  className="bg-violet-700 hover:bg-violet-600 text-white font-medium px-8 py-2.5 rounded-xl transition active:scale-95 text-sm"
                >
                  Iniciar
                </button>
                <button
                  onClick={onLogin}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition active:scale-95 text-sm"
                >
                  ↺
                </button>
              </div>
            </div>

            {/* Meta demo */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-white font-semibold text-sm">Meta do dia</p>
              <p className="text-white/40 text-sm">
                <span className="text-white font-bold text-2xl">0</span> / 4 sessões
              </p>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="h-2 rounded-full bg-violet-600" style={{ width: "0%" }} />
              </div>
              <p className="text-white/20 text-xs">
                Entre para salvar seu progresso e definir metas personalizadas
              </p>
              <button
                onClick={onLogin}
                className="text-violet-400 hover:text-violet-300 text-xs transition text-left"
              >
                Criar conta para salvar →
              </button>
            </div>
          </div>

          <div className="hidden xl:block w-px bg-white/5 self-stretch" />

          {/* Tarefas demo */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-xl">Tarefas do dia</h2>
              <span className="text-xs text-slate-500">3 pendentes</span>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-col gap-3">
              <input
                type="text"
                placeholder="O que você precisa fazer?"
                onClick={onLogin}
                readOnly
                className="bg-white/5 text-white rounded-xl px-4 py-2.5 outline-none placeholder-white/20 w-full text-sm cursor-pointer"
              />
              <button
                onClick={onLogin}
                className="bg-violet-700 hover:bg-violet-600 text-white font-semibold py-2.5 rounded-xl transition active:scale-95 text-sm"
              >
                Adicionar tarefa
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {tarefas.map((t) => (
                <div
                  key={t.id}
                  className="bg-white/3 border border-white/8 rounded-2xl px-4 py-3 flex items-center gap-3 hover:border-white/15 transition"
                >
                  <div className={`w-1.5 h-8 rounded-full shrink-0 ${t.cor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{t.titulo}</p>
                    <p className="text-white/30 text-xs">{t.cat}</p>
                  </div>
                  <button
                    onClick={onLogin}
                    className="shrink-0 w-6 h-6 rounded-full border-2 border-white/15 hover:border-violet-500 transition flex items-center justify-center"
                  >
                    <span className="text-xs opacity-0 hover:opacity-100">✓</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-10 pb-20 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { emoji: "🧠", titulo: "Baseado em ciência", desc: "Desenvolvido com base em pesquisas sobre TDAH e foco para maximizar sua produtividade." },
            { emoji: "🎯", titulo: "Timer Pomodoro", desc: "25 minutos de foco, 5 de pausa. O método mais comprovado para manter concentração." },
            { emoji: "📋", titulo: "Tarefas priorizadas", desc: "Organize suas tarefas por prioridade e categoria para saber exatamente o que fazer primeiro." },
          ].map((f) => (
            <div key={f.titulo} className="bg-white/2 border border-white/5 rounded-2xl p-6 flex flex-col gap-3">
              <span style={{ fontSize: 24 }}>{f.emoji}</span>
              <p className="text-white font-semibold text-sm">{f.titulo}</p>
              <p className="text-white/30 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="flex flex-col items-center text-center px-6 pb-20 gap-4">
        <p className="text-white/60 text-lg font-medium">Pronto para começar?</p>
        <button
          onClick={onLogin}
          className="bg-violet-700 hover:bg-violet-600 text-white font-semibold px-10 py-3 rounded-2xl transition-all duration-200 active:scale-95 text-sm shadow-lg shadow-violet-900/30"
        >
          Criar conta grátis
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-6 flex items-center justify-center mt-auto">
        <p className="text-white/15 text-xs">Focus Web · Feito para estudantes</p>
      </footer>
    </div>
  )
}