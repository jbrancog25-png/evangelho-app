/**
 * A data de hoje no Brasil, no formato do banco (`AAAA-MM-DD`).
 *
 * `new Date().toISOString().slice(0, 10)` dá a data em UTC: das 21h à
 * meia-noite ela já é a de amanhã. O versículo marcado para hoje sumia toda
 * noite, e o marcado à noite caía no dia seguinte.
 */
export function hojeLocal(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
  } catch {
    const d = new Date()
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 10)
  }
}
