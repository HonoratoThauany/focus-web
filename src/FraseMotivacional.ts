const frases = [
  "Um passo de cada vez. Você consegue.",
  "Foco não é sobre fazer mais, é sobre fazer o que importa.",
  "Cada sessão te deixa mais perto do seu objetivo.",
  "Seu cérebro está trabalhando. Confie no processo.",
  "25 minutos. Só isso. Você é capaz.",
  "Desconecte do ruído. Conecte com o que importa.",
  "A disciplina é a ponte entre metas e conquistas.",
  "Pequenos progressos diários levam a grandes resultados.",
  "Você não precisa de motivação, precisa de hábito.",
  "Respira. Foca. Entrega."
]

export function fraseAleatoria(): string {
  return frases[Math.floor(Math.random() * frases.length)]
}