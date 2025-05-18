import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from '@renderer/features/auth/pages/login'
import Singup from '@renderer/features/auth/pages/signUp'
import FormDentis from '@renderer/features/dentist/pages/formDentis'
import DentistDashboard from '@renderer/features/dentist/pages/dentistDashboard'
import ProfileSelection from '@renderer/features/parent/pages/profileSelection'
import HomePageFather from '@renderer/features/parent/pages/fatherHome'
import AppointmentsFather from '@renderer/features/parent/pages/appointmentsFather'
import DentisDirectory from '@renderer/features/parent/pages/dentistsDirectory'
import DentistDetail from '@renderer/features/parent/pages/dentistDetail'

function AuthRoutes(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomePageFather />} />
      <Route path="/signup" element={<Singup />} />

      {/* Routes for Dentist */}
      <Route path="/formDentist" element={<FormDentis />} />
      <Route path="/dentistDashboard" element={<DentistDashboard />} />

      {/* Routes for Child */}
      {/* <Route path="/childDashboard" element={<ChildDashboard />} /> */}

      {/* Routes for Father */}
      <Route path="/profile-selection" element={<ProfileSelection />} />
      <Route path="/homeFather" element={<HomePageFather />} />
      <Route path="/appointmentFather" element={<AppointmentsFather />} />
      <Route path="/dentistDirectory" element={<DentisDirectory />} />
      <Route path="/dentist/:dentistId" element={<DentistDetail />} />
    </Routes>
  )
}

export default AuthRoutes
