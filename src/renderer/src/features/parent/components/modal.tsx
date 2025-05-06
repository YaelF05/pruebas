import React, { ReactNode, useEffect } from 'react'
import styles from '../styles/modal.module.css'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
  }
  
  const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    // Close modal with escape key
    useEffect(() => {
      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose()
        }
      }
  
      document.addEventListener('keydown', handleEscapeKey)
      
      // Prevent body scrolling when modal is open
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
  
      return () => {
        document.removeEventListener('keydown', handleEscapeKey)
        document.body.style.overflow = 'auto'
      }
    }, [isOpen, onClose])
  
    if (!isOpen) return null
  
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{title}</h2>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div className={styles.modalBody}>
            {children}
          </div>
        </div>
      </div>
    )
  }
  
  export default Modal