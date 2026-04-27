export function tocarSomFim() {
  const contexto = new AudioContext()

  const notas = [523, 659, 784, 1047]

  notas.forEach((frequencia, i) => {
    const oscilador = contexto.createOscillator()
    const ganho = contexto.createGain()

    oscilador.connect(ganho)
    ganho.connect(contexto.destination)

    oscilador.frequency.value = frequencia
    oscilador.type = "sine"

    const inicio = contexto.currentTime + i * 0.15
    const fim = inicio + 0.3

    ganho.gain.setValueAtTime(0, inicio)
    ganho.gain.linearRampToValueAtTime(0.3, inicio + 0.05)
    ganho.gain.linearRampToValueAtTime(0, fim)

    oscilador.start(inicio)
    oscilador.stop(fim)
  })
}

export function tocarSomPausa() {
  const contexto = new AudioContext()

  const oscilador = contexto.createOscillator()
  const ganho = contexto.createGain()

  oscilador.connect(ganho)
  ganho.connect(contexto.destination)

  oscilador.frequency.value = 440
  oscilador.type = "sine"

  ganho.gain.setValueAtTime(0, contexto.currentTime)
  ganho.gain.linearRampToValueAtTime(0.2, contexto.currentTime + 0.05)
  ganho.gain.linearRampToValueAtTime(0, contexto.currentTime + 0.4)

  oscilador.start(contexto.currentTime)
  oscilador.stop(contexto.currentTime + 0.4)
}