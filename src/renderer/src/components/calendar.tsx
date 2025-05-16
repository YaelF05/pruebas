import React, { useState, useRef, useEffect } from 'react'
import styles from '../styles/calendar.module.css'
import Calendario from '@renderer/assets/icons/calendar.png'

interface CalendarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange }) => {
  const [showCalendar, setShowCalendar] = useState<boolean>(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Formatear la fecha para mostrar
  const formattedDay = selectedDate.getDate().toString().padStart(2, '0')
  const formattedMonth = new Intl.DateTimeFormat('es', { month: 'long' }).format(selectedDate)
  const capitalizedMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1)

  // Función para ir al día anterior
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handlePreviousDay = () => {
    const prevDay = new Date(selectedDate)
    prevDay.setDate(prevDay.getDate() - 1)
    onDateChange(prevDay)
  }

  // Función para ir al día siguiente
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleNextDay = () => {
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)
    onDateChange(nextDay)
  }

  // Función para mostrar/ocultar el calendario
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar)
  }

  // Función para seleccionar una fecha del calendario
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSelectDate = (date: Date) => {
    onDateChange(date)
    setShowCalendar(false)
  }

  // Cerrar el calendario cuando se hace clic fuera de él
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Función para generar los días del calendario
  const generateCalendarDays = (): (Date | null)[] => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)

    const firstDayOfWeek = firstDayOfMonth.getDay()

    const lastDayOfMonth = new Date(year, month + 1, 0).getDate()

    const daysArray: (Date | null)[] = []

    for (let i = 0; i < firstDayOfWeek; i++) {
      daysArray.push(null)
    }

    for (let i = 1; i <= lastDayOfMonth; i++) {
      daysArray.push(new Date(year, month, i))
    }

    return daysArray
  }

  const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.dateInfo}>
        <div className={styles.dayNumber}>{formattedDay}</div>
        <div className={styles.month}>{capitalizedMonth}</div>
      </div>

      <div className={styles.navigationControls}>
        <button className={styles.navButton} onClick={handlePreviousDay}>
          &lt;
        </button>
        <button className={styles.calendarButton} onClick={toggleCalendar}>
          <img src={Calendario} alt="Calendar" width="35" height="35" />
        </button>
        <button className={styles.navButton} onClick={handleNextDay}>
          &gt;
        </button>
      </div>

      {/* Calendario desplegable */}
      {showCalendar && (
        <div className={styles.calendarDropdown} ref={calendarRef}>
          <div className={styles.calendarHeader}>
            <div className={styles.calendarTitle}>
              {new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(
                selectedDate
              )}
            </div>
            <div className={styles.calendarNavigation}>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setMonth(newDate.getMonth() - 1)
                  onDateChange(newDate)
                }}
              >
                &#8249;
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setMonth(newDate.getMonth() + 1)
                  onDateChange(newDate)
                }}
              >
                &#8250;
              </button>
            </div>
          </div>

          <div className={styles.weekDays}>
            {weekDays.map((day) => (
              <div key={day} className={styles.weekDay}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.calendarDays}>
            {generateCalendarDays().map((day, index) => {
              const isCurrentDate =
                day &&
                day.getDate() === selectedDate.getDate() &&
                day.getMonth() === selectedDate.getMonth() &&
                day.getFullYear() === selectedDate.getFullYear()

              return (
                <div
                  key={index}
                  className={`
                    ${styles.calendarDay}
                    ${!day ? styles.emptyDay : ''}
                    ${isCurrentDate ? styles.selectedDay : ''}
                  `}
                  onClick={() => day && handleSelectDate(day)}
                >
                  {day ? day.getDate() : ''}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
