import { useState } from 'react'
import heroImage from '@renderer/assets/images/dentalDesign.svg'
import InputForm from '@renderer/components/inputForm'
import Button from '@renderer/components/button'
import styles from '../styles/login.module.css'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    //Manejo se sesión*
    console.log('Login submitted:', { email, password })
  }

  return (
    <div className={styles.container}>
      {/* Hero section */}
      <section className={styles.heroImage}>
        <img src={heroImage} alt="Hero image odonto" />
      </section>

      {/* Forms section */}
      <section className={styles.formContainer}>
        <h1 className={styles.formTitle}>¡Bienvenido de nuevo!</h1>

        <form onSubmit={handleSubmit} method="POST" className={styles.form}>
          <fieldset className={styles.fieldset}>
            <InputForm
              label="Correo electrónico"
              name="email"
              type="email"
              value={email}
              placeholder="correo electrónico"
              onChange={(e) => setEmail(e.target.value)}
              required={true}
            />
            <InputForm
              label="Contraseña"
              name="password"
              type="password"
              value={password}
              placeholder="Contraseña"
              onChange={(e) => setPassword(e.target.value)}
              required={true}
            />
          </fieldset>

          <div className={styles.containerButton}>
            <Button name={'Iniciar sesión'} type={'submit'} />
            <p>¿Aún no tiene cuenta?</p>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Login
