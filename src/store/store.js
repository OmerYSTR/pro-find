import { configureStore } from "@reduxjs/toolkit"
import authReducer from './authSlice'
import professionalReducer from "./professionalsSlice"    
import appointmentReducer from "./appointmentsSlice"

export const store = configureStore({
    reducer:{
        auth: authReducer,
        professional: professionalReducer,
        appointment: appointmentReducer,
    }
})