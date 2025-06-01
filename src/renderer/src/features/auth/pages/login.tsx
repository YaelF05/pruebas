import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoginCredentials } from '../types/authTypes'
import { validateEmail, validatePassword } from '@renderer/utils/validators'
import heroImage from '@renderer/assets/images/dentalDesign.png'
import InputForm from '@renderer/components/inputForm'
import Button from '@renderer/components/button'
import styles from '../styles/login.module.css'

const Login = (): React.JSX.Element => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loginError, setLoginError] = useState<string | null>(null)
  const { login, isLoading, userType } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setErrors({})
    setLoginError(null)

    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    if (emailError || passwordError) {
      setErrors({ email: emailError || undefined, password: passwordError || undefined })
      return
    }

    const credentials: LoginCredentials = { email, password }

    try {
      await login(credentials)

      if (userType === 'DENTIST') {
        navigate('/dentistDashboard')
      } else if (userType === 'FATHER') {
        navigate('/profile-selection')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'

      if (errorMessage.includes('Authentication failed: 401')) {
        setLoginError('Correo o contraseña incorrectos')
      } else if (errorMessage.includes('Authentication failed: 403')) {
        setLoginError('Acceso denegado')
      } else if (errorMessage.includes('Authentication failed: 500')) {
        setLoginError('Error del servidor. Intenta más tarde')
      } else {
        setLoginError('Error de conexión. Verifica tu internet')
      }
    }
  }

  return (
    <div className={styles.container}>
      <section className={styles.heroSection}>
        <img src={heroImage} alt="Ilustración dental" className={styles.heroImage} />
      </section>

      <section className={styles.formSection}>
        <div className={styles.formWrapper}>
          <h1 className={styles.formTitle}>¡Bienvenido de nuevo!</h1>
          {loginError && <div className={styles.loginError}>{loginError}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <InputForm
                label={'Correo electrónico'}
                name={'email'}
                type={'email'}
                value={email}
                placeholder={'Ingrese su correo electrónico'}
                onChange={(e) => setEmail(e.target.value)}
                required={true}
              />
              {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}

              <InputForm
                label={'Contraseña'}
                name={'password'}
                type={'password'}
                value={password}
                placeholder={'Ingrese su contraseña'}
                onChange={(e) => setPassword(e.target.value)}
                required={true}
              />
              {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}

              <div className={styles.forgotPassword}>
                <Link to="/recover-password">¿Olvidaste tu contraseña?</Link>
              </div>
            </div>

            <div className={styles.actionGroup}>
              <Button
                name={isLoading ? 'Procesando...' : 'Iniciar sesión'}
                type={'submit'}
                disabled={isLoading}
              />
              <p className={styles.registerPrompt}>
                ¿Aún no tienes cuenta?{' '}
                <Link to="/signup" className={styles.registerLink}>
                  <u>Crea una</u>
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Login
