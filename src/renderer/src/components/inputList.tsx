import React, { useState } from 'react'
import styles from '../styles/inputList.module.css'

interface SelectListProps {
  option1: string
  option2: string
  label: string
  name: string
  value: string
  placeholder: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  required?: boolean
}

const SelectList: React.FC<SelectListProps> = ({
  option1,
  option2,
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={styles.input}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        <option value={option1}>{option1}</option>
        <option value={option2}>{option2}</option>
      </select>
    </div>
  )
}

export default SelectList
