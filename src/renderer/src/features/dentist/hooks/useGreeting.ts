import { useState, useEffect } from 'react'

/**
 * Custom hook to get a greeting based on the current time.
 * @returns {string} The greeting message.
 */
export function useGreeting(): string {
  const [greeting, setGreeting] = useState<string>('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Buenos días')
    else if (hour < 18) setGreeting('Buenas tardes')
    else setGreeting('Buenas noches')
  }, [])

  return greeting
}
