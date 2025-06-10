import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signupService } from '../services/signupService'
import { useAuth } from '../hooks/useAuth'
import { SignupCredentials, LoginCredentials } from '../types/authTypes'
import {
  validateType,
  validateName,
  validateLastName,
  validateBirthDate,
  validateEmail,
  validatePassword,
  validateConfirmPassword
} from '@renderer/utils/validators'
import heroImageSignup from '@renderer/assets/images/heroImageSignup.png'
import InputForm from '@renderer/components/inputForm'
import InputList from '@renderer/components/inputList'
import Button from '@renderer/components/button'
import styles from '@renderer/features/auth/styles/signUp.module.css'

const Signup = (): React.JSX.Element => {
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { login } = useAuth()
  const [errors, setErrors] = useState<{
    type?: string
    name?: string
    lastName?: string
    birthDate?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [signupError, setSignupError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const typeOptions = [
    { label: 'Padre', value: 'FATHER' },
    { label: 'Odontólogo', value: 'DENTIST' }
  ]

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setErrors({})
    setSignupError(null)
    setIsLoading(true)

    const typeError = validateType(type)
    const nameError = validateName(name)
    const lastNameError = validateLastName(lastName)
    const birthDateError = validateBirthDate(birthDate)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword)

    if (
      typeError ||
      nameError ||
      lastNameError ||
      birthDateError ||
      emailError ||
      passwordError ||
      confirmPasswordError
    ) {
      setErrors({
        type: typeError || undefined,
        name: nameError || undefined,
        lastName: lastNameError || undefined,
        birthDate: birthDateError || undefined,
        email: emailError || undefined,
        password: passwordError || undefined,
        confirmPassword: confirmPasswordError || undefined
      })
      setIsLoading(false)
      return
    }

    const credentials: SignupCredentials = {
      type,
      name,
      lastName,
      birthDate,
      email,
      password,
      confirmPassword
    }

    const credentialsLogin: LoginCredentials = { email, password }

    try {
      await signupService(credentials)

      const loginResult = await login(credentialsLogin)

      console.log('localStorage authToken:', localStorage.getItem('authToken'))
      console.log('localStorage authExpiration:', localStorage.getItem('authExpiration'))
      console.log('localStorage userType:', localStorage.getItem('userType'))

      if (loginResult.userType === 'DENTIST') {
        navigate('/formDentist')
      } else if (loginResult.userType === 'FATHER') {
        navigate('/formFather')
      }
    } catch (error) {
      console.error('Error al relizar el registro:', error)
      setSignupError('Error al realizar el registro. Por favor, inténtalo de nuevo más tarde')
    } finally {
      setIsLoading(false)
    }
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
        {signupError && <div className={styles.signupError}>{signupError}</div>}

        {/* Formulario de registro */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldset}>
            <InputList
              options={typeOptions}
              label="Padre u odontólogo"
              name="role"
              value={type}
              placeholder="Padre u odontólogo"
              onChange={(e) => setType(e.target.value)}
              required
            />

            {errors.type && <div className={styles.errorMessage}>{errors.type}</div>}
            <InputForm
              label={'Nombre(s)'}
              name={'name'}
              type={'text'}
              value={name}
              placeholder={'Nombre(s)'}
              onChange={(e) => setName(e.target.value)}
              required={true}
            />
            {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
            <InputForm
              label={'Apellidos'}
              name={'lastName'}
              type={'text'}
              value={lastName}
              placeholder={'Apellidos'}
              onChange={(e) => setLastName(e.target.value)}
              required={true}
            />
            {errors.lastName && <div className={styles.errorMessage}>{errors.lastName}</div>}
            <InputForm
              label={'Fecha de nacimiento'}
              name={'birthDate'}
              type={'date'}
              value={birthDate}
              placeholder={'Fecha de nacimiento'}
              onChange={(e) => setBirthDate(e.target.value)}
              required={true}
            />
            {errors.birthDate && <div className={styles.errorMessage}>{errors.birthDate}</div>}
            <InputForm
              label={'Correo electrónico'}
              name={'email'}
              type={'email'}
              value={email}
              placeholder={'Correo electrónico'}
              onChange={(e) => setEmail(e.target.value)}
              required={true}
            />
            {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
            <InputForm
              label={'Contraseña'}
              name={'password'}
              type={'password'}
              value={password}
              placeholder={'Contraseña'}
              onChange={(e) => setPassword(e.target.value)}
              required={true}
            />
            {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
            <InputForm
              label={'Confirmar contraseña'}
              name={'confirmPassword'}
              type={'password'}
              value={confirmPassword}
              placeholder={'Confirmar contraseña'}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required={true}
            />
            {errors.confirmPassword && (
              <div className={styles.errorMessage}>{errors.confirmPassword}</div>
            )}
          </div>

          <Button
            name={isLoading ? 'Procesando...' : 'Crear cuenta'}
            type={'submit'}
            disabled={isLoading}
          />
          <p className={styles.registerPrompt}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/" className={styles.loginLink}>
              <u>Inicia sesión</u>
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
export default Signup
