import React, { useState } from 'react'
import styles from '../styles/inputList.module.css'

interface Option {
  label: string
  value: string
}

interface SelectListProps {
  options: Option[]
  label: string
  name: string
  value: string
  placeholder: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  required?: boolean
}

const SelectList: React.FC<SelectListProps> = ({
  options,
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
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectList
