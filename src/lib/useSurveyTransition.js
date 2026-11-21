import { useCallback, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import './survey-transition.css'

// Capture the outgoing and incoming panels so both move during a step change.
export default function useSurveyTransition() {
  const current = useRef(null)
  useEffect(() => () => {
    current.current?.skipTransition()
    delete document.documentElement.dataset.surveyDirection
  }, [])

  return useCallback((update, direction, instant = false) => {
    current.current?.skipTransition()
    const focusStep = () => {
      const panel = document.querySelector('[data-survey-step]')
      const target = direction === 'forward'
        ? panel?.querySelector('[name="survey-title"], #sb-name')
        : panel?.querySelector('[data-survey-return]')
      const focusTarget = target || panel?.querySelector('input, button, select, textarea')
      focusTarget?.focus({ preventScroll: true })
    }
    if (instant || matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition) {
      flushSync(update)
      focusStep()
      return
    }
    document.documentElement.dataset.surveyDirection = direction
    const transition = document.startViewTransition(() => flushSync(update))
    current.current = transition
    transition.updateCallbackDone.then(focusStep).catch(() => {})
    transition.finished.catch(() => {}).finally(() => {
      if (current.current !== transition) return
      current.current = null
      delete document.documentElement.dataset.surveyDirection
    })
  }, [])
}
