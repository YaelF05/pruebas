import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from '@renderer/features/auth/pages/login'
import Singup from '@renderer/features/auth/pages/signUp'
import FormDentis from '@renderer/features/dentist/pages/formDentis'
import ProfileSelection from '@renderer/features/parent/pages/profileSelection'
import HomePage from '@renderer/features/parent/pages/home'

function AuthRoutes(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/singup" element={<Singup />} />
      <Route path="/formDentist" element={<FormDentis />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile-selection" element={<ProfileSelection />} />
    </Routes>
  )
}

export default AuthRoutes
