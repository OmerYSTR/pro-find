import { configureStore } from "@reduxjs/toolkit"
import authReducer from './authSlice'
import professionalReducer from "./professionalsSlice"    
import appointmentReducer from "./appointmentsSlice"
import socketReducer from "./socketSlice"

export const store = configureStore({
    reducer:{
        auth: authReducer,
        professional: professionalReducer,
        appointment: appointmentReducer,
        socket: socketReducer
    }
})