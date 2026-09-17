import { useEffect, useState } from 'react'

interface UseTypewriterOptions {
  speed?: number
  startDelay?: number
}

export function useTypewriter(text: string, { speed = 38, startDelay = 600 }: UseTypewriterOptions = {}) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)

    let charIndex = 0
    let intervalId: ReturnType<typeof setInterval> | undefined

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        charIndex += 1
        setDisplayed(text.slice(0, charIndex))
        if (charIndex >= text.length) {
          if (intervalId) clearInterval(intervalId)
          setDone(true)
        }
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [text, speed, startDelay])

  return { displayed, done }
}
