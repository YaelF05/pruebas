import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginService, saveAuth } from '../services/loginService'
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
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setErrors({})
    setLoginError(null)
    setIsLoading(true)

    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    if (emailError || passwordError) {
      setErrors({ email: emailError || undefined, password: passwordError || undefined })
      setIsLoading(false)
      return
    }

    const credentials: LoginCredentials = { email, password }

    try {
      const result = await loginService(credentials)
      saveAuth(result.token, result.userType)
      if (result.userType === 'DENTIST') {
        navigate('/dentistDashboard')
      } else if (result.userType === 'FATHER') {
        navigate('/fatherDashboard')
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      setLoginError('Correo o contraseña incorrectos')
    } finally {
      setIsLoading(false)
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
