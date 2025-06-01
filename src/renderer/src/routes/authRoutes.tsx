import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from '@renderer/features/auth/pages/login'
import Singup from '@renderer/features/auth/pages/signUp'
import FormDentis from '@renderer/features/dentist/pages/formDentis'
import DentistDashboard from '@renderer/features/dentist/pages/dentistDashboard'
import ProfileSelection from '@renderer/features/parent/pages/profileSelection'
import FatherDashboard from '@renderer/features/parent/pages/fatherDashboard'
import AppointmentsFather from '@renderer/features/parent/pages/appointmentsFather'
import DentisDirectory from '@renderer/features/parent/pages/dentistsDirectory'
import DentistDetail from '@renderer/features/parent/pages/dentistDetail'
import AppointmentDentist from '@renderer/features/dentist/pages/appoinmentsDentist'
import Patients from '@renderer/features/dentist/pages/patients'
import SettingsDentist from '@renderer/features/dentist/pages/settingsDentist'
import ProfileDentist from '@renderer/features/dentist/pages/profile'
import ChildrenPage from '../features/parent/pages/childrenPage'
import ChildDetail from '@renderer/features/parent/pages/childDetail'

function AuthRoutes(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Singup />} />

      {/* Routes for Dentist */}
      <Route path="/formDentist" element={<FormDentis />} />
      <Route path="/dentistDashboard" element={<DentistDashboard />} />
      <Route path="/citasDentist" element={<AppointmentDentist />} />
      <Route path="/pacientes" element={<Patients />} />
      <Route path="/configuracion" element={<SettingsDentist />} />
      <Route path="/perfil" element={<ProfileDentist />} />

      {/* Routes for Child */}
      {/* <Route path="/childDashboard" element={<ChildDashboard />} /> */}

      {/* Routes for Father */}
      <Route path="/profile-selection" element={<ProfileSelection />} />
      <Route path="/fatherDashboard" element={<FatherDashboard />} />
      <Route path="/appointmentFather" element={<AppointmentsFather />} />
      <Route path="/dentistDirectory" element={<DentisDirectory />} />
      <Route path="/dentist/:dentistId" element={<DentistDetail />} />
      <Route path="/children" element={<ChildrenPage />} />
      <Route path="/child/:childId" element={<ChildDetail />} />
    </Routes>
  )
}

export default AuthRoutes
