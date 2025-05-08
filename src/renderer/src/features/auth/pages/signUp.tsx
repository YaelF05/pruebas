import React, { useState } from 'react'
import heroImageSignup from '@renderer/assets/images/heroImageSignup.png'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import Button from '@renderer/components/button'
import styles from '@renderer/features/auth/styles/signUp.module.css'

const SignUp = (): React.JSX.Element => {
  const [role, setRole] = useState('')
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    // Manejo de registro
    console.log('Formulario enviado:', {
      role,
      name,
      lastName,
      birthDate,
      email,
      password
    })
  }

  return (
    <div className={styles.container}>
      {/* Sección hero/imagen */}
      <div className={styles.heroImage}>
        <img src={heroImageSignup} alt="Ilustración dental" />
      </div>

      {/* Sección de formulario */}
      <div className={styles.formContainer}>
        <h1>Crea tu cuenta para empezar a cuidar sonrisas</h1>
        <p>Crea tu cuenta como padre o profesional dental para empezar a usar la app</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldset}>
            <InputList
              option1={'Padre'}
              option2={'Odontólogo'}
              label={'Padre u odontólogo'}
              name={'role'}
              value={role}
              placeholder={'Padre u odontólogo'}
              onChange={(e) => setRole(e.target.value)}
              required={true}
            />
            <InputForm
              label={'Nombre(s)'}
              name={'name'}
              type={'text'}
              value={name}
              placeholder={'Nombre(s)'}
              onChange={(e) => setName(e.target.value)}
              required={true}
            />
            <InputForm
              label={'Apellidos'}
              name={'lastName'}
              type={'text'}
              value={lastName}
              placeholder={'Apellidos'}
              onChange={(e) => setLastName(e.target.value)}
              required={true}
            />
            <InputForm
              label={'Fecha de nacimiento'}
              name={'birthDate'}
              type={'date'}
              value={birthDate}
              placeholder={'Fecha de nacimiento'}
              onChange={(e) => setBirthDate(e.target.value)}
              required={true}
            />
            <InputForm
              label={'Correo electrónico'}
              name={'email'}
              type={'email'}
              value={email}
              placeholder={'Correo electrónico'}
              onChange={(e) => setEmail(e.target.value)}
              required={true}
            />
            <InputForm
              label={'Contraseña'}
              name={'password'}
              type={'password'}
              value={password}
              placeholder={'Contraseña'}
              onChange={(e) => setPassword(e.target.value)}
              required={true}
            />
            <InputForm
              label={'Confirmar contraseña'}
              name={'confirmPassword'}
              type={'password'}
              value={confirmPassword}
              placeholder={'Confirmar contraseña'}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required={true}
            />
          </div>

          <Button name={'Crear cuenta'} type={'submit'} />
        </form>
      </div>
    </div>
  )
}

export default SignUp
