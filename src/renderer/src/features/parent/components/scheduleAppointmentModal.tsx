import React, { useState, useEffect } from 'react'
import Modal from './modal'
import InputForm from '@renderer/components/inputForm'
import TextareaInput from '@renderer/components/textareaInput'
import InputList from '@renderer/components/inputList'
import styles from '../styles/appointmentModal.module.css'

interface Child {
  id: number
  name: string
  last_name?: string
}

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  dentistId: number
  onSchedule: (data: { childId: number; date: string; time: string; reason: string }) => void
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onSchedule }) => {
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [time, setTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [children, setChildren] = useState<Child[]>([])
  const [, setLoading] = useState<boolean>(false)

  // Obtener lista de hijos del padre
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const fetchChildren = async () => {
      try {
        setLoading(true)
        // Aquí deberías hacer la llamada a la API para obtener los hijos
        // Por ahora usamos datos de ejemplo
        const mockChildren: Child[] = [
          { id: 1, name: 'Ana', last_name: 'García' },
          { id: 2, name: 'Luis', last_name: 'García' }
        ]
        setChildren(mockChildren)
      } catch (error) {
        console.error('Error al obtener los hijos:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchChildren()
    }
  }, [isOpen])

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSubmit = () => {
    // Validar entradas
    if (!selectedChild || !date || !time || !reason.trim()) {
      alert('Por favor complete todos los campos')
      return
    }

    const childId = parseInt(selectedChild)

    // Llamar al callback con los datos de la cita
    onSchedule({
      childId,
      date,
      time,
      reason
    })
  }

  // Preparar opciones de hijos para el dropdown
  const childOptions = children.map((child) => ({
    label: `${child.name} ${child.last_name || ''}`,
    value: child.id.toString()
  }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agenda tu cita">
      <div className={styles.modalContent}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Seleccione hijo</label>
          <InputList
            options={childOptions}
            label="Seleccione hijo"
            name="childId"
            value={selectedChild}
            placeholder="Seleccione un hijo"
            onChange={(e) => setSelectedChild(e.target.value)}
            required={true}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ingresa la fecha y horario para la cita</label>
          <div className={styles.dateTimeGroup}>
            <InputForm
              label="Nueva fecha"
              name="date"
              type="date"
              value={date}
              placeholder="Seleccione fecha"
              onChange={(e) => setDate(e.target.value)}
              required={true}
            />
            <InputForm
              label="Nuevo horario"
              name="time"
              type="time"
              value={time}
              placeholder="Seleccione horario"
              onChange={(e) => setTime(e.target.value)}
              required={true}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Motivo de la cita</label>
          <TextareaInput
            label="Motivo de la cita"
            name="reason"
            value={reason}
            placeholder="Describa brevemente el motivo de su cita"
            onChange={(e) => setReason(e.target.value)}
            required={true}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Regresar
          </button>
          <button type="button" className={styles.scheduleButton} onClick={handleSubmit}>
            Agendar cita
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default AppointmentModal
