import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import heroImage from '@renderer/assets/images/dentalDesign.svg'
import InputForm from '@renderer/components/inputForm'
import Button from '@renderer/components/button'
import styles from '../styles/login.module.css'

const Login = (): React.JSX.Element => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    try {
      // Inicio de sesión (simulado)
      console.log('Iniciando sesión con:', { email, password })
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
    }
  }

  return (
    <div className={styles.container}>
      {/* Sección hero/imagen */}
      <section className={styles.heroSection}>
        <img src={heroImage} alt="Ilustración dental" className={styles.heroImage} />
      </section>

      {/* Sección de formulario */}
      <section className={styles.formSection}>
        <div className={styles.formWrapper}>
          <h1 className={styles.formTitle}>¡Bienvenido de nuevo!</h1>

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
              <InputForm
                label={'Contraseña'}
                name={'password'}
                type={'password'}
                value={password}
                placeholder={'Ingrese su contraseña'}
                onChange={(e) => setPassword(e.target.value)}
                required={true}
              />

              <div className={styles.forgotPassword}>
                <Link to="/recover-password">¿Olvidaste tu contraseña?</Link>
              </div>
            </div>

            <div className={styles.actionGroup}>
              <Button name={'Iniciar sesión'} type={'submit'} />
              <p className={styles.registerPrompt}>
                ¿Aún no tienes cuenta?{' '}
                <Link to="/singup" className={styles.registerLink}>
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
