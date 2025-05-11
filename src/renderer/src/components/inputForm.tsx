import React, { useState } from 'react'
import styles from '../styles/inputForm.module.css'

interface InputProps {
  label: string
  name: string
  type?: string
  value: string
  placeholder: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  classname?: string
}

const InputForm: React.FC<InputProps> = ({
  label,
  name,
  type = 'text',
  value,
  placeholder,
  onChange,
  required,
  classname = ''
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const isDateTimeType = ['date', 'time', 'datetime-local', 'month', 'week'].includes(type)

  // Mostrar label si está enfocado, tiene valor o es un tipo date/time
  const showLabel = isFocused || value.length > 0 || isDateTimeType

  return (
    <div className={styles.container}>
      {showLabel && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        className={`${styles.input} ${classname}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  )
}

export default InputForm
