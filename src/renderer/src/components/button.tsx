import React from 'react'
import styles from '../styles/button.module.css'

interface ButtonProps {
  name: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({ name, type = 'button', onClick, disabled = false }) => {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={styles.button}>
      {name}
    </button>
  )
}

export default Button
