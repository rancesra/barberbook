/**
 * Vibración corta al tocar, como la respuesta táctil del sistema.
 *
 * Android/Chrome: usa la API de vibración estándar.
 * iOS/Safari: no soporta esa API. El truco es un <input type="checkbox" switch>
 *   (iOS 17.4+), que sí produce háptica al alternarse desde un gesto del
 *   usuario. Si el iPhone es más viejo, simplemente no pasa nada.
 */

let iosSwitch: HTMLInputElement | null = null

function getIosSwitch(): HTMLInputElement | null {
  if (typeof document === 'undefined') return null
  if (iosSwitch) return iosSwitch

  const input = document.createElement('input')
  input.type = 'checkbox'
  // El atributo "switch" solo existe en Safari 17.4+; si no, esto es inerte.
  if (!('switch' in input)) return null

  input.setAttribute('switch', '')
  input.setAttribute('aria-hidden', 'true')
  input.tabIndex = -1
  input.style.cssText = 'position:fixed;top:-100px;left:-100px;width:1px;height:1px;opacity:0;pointer-events:none;'
  document.body.appendChild(input)
  iosSwitch = input
  return input
}

export type HapticStrength = 'light' | 'medium' | 'success'

const PATTERNS: Record<HapticStrength, number | number[]> = {
  light: 10,
  medium: 18,
  success: [12, 40, 22],
}

export function haptic(strength: HapticStrength = 'light') {
  if (typeof window === 'undefined') return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // Android y navegadores con soporte estándar
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(PATTERNS[strength])
      return
    } catch {
      // sigue al plan B
    }
  }

  // iOS 17.4+
  try {
    const sw = getIosSwitch()
    if (sw) sw.click()
  } catch {
    // sin háptica; no es crítico
  }
}
