export type HostWizardEventName =
  | 'host_wizard_step_view'
  | 'host_wizard_step_blocked'
  | 'host_wizard_submit_success'
  | 'host_wizard_submit_fail'

export function trackHostWizardEvent(
  event: HostWizardEventName,
  payload: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return

  const data = {
    event,
    ...payload,
    ts: Date.now(),
  }

  // Integración futura: Segment/GA/DataLayer.
  // Por ahora, mantenemos una cola en memoria del navegador para depurar y analizar el flujo.
  const w = window as Window & { __hostWizardEvents?: Array<Record<string, unknown>> }
  w.__hostWizardEvents = w.__hostWizardEvents ?? []
  w.__hostWizardEvents.push(data)
}
