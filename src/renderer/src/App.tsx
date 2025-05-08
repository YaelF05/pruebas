import React from 'react'
import { HashRouter as Router } from 'react-router-dom'
import AuthRoutes from '@renderer/routes/authRoutes'

function App(): React.JSX.Element {
  return (
    <Router>
      <AuthRoutes />
    </Router>
  )
}

export default App
