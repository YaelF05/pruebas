import React, { useState } from 'react'
import styles from '../styles/textareaInput.module.css'

interface InputProps {
  label: string
  name: string
  value: string
  placeholder: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  required?: boolean
  classname?: string
}

const TextareaInput: React.FC<InputProps> = ({
  label,
  name,
  value,
  placeholder,
  onChange,
  required
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const showLabel = isFocused || value.length > 0

  return (
    <div className={styles.container}>
      {showLabel && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        className={styles.input}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  )
}

export default TextareaInput
