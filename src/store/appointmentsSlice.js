import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    userAppointments: [],
    freelancerAppointments: []
}

const appointmentSlice = createSlice({
    name: "appointments",
    initialState, 
    reducers:{
        appointmentRecvd(state, action){
            state.userAppointments = action.payload
            state.freelancerAppointments = action.payload
        },
        appointmentAddedForUser(state, action){
            state.userAppointments.push(action.payload)
        },
        appointmentAddedForFreelancer(state, action){
            state.freelancerAppointments.push(action.payload)
        },
        appointmentRemovedForUser(state, action){
            state.userAppointments = state.userAppointments.filter(a => a!==action.payload)
        },
        appointmentRemovedForFreelancer(state, action){
            state.freelancerAppointments = state.freelancerAppointments.filter(a => a!==action.payload)
        }
    }
})

export const {
    appointmentRecvd, 
    appointmentAddedForUser, 
    appointmentAddedForFreelancer,
    appointmentRemovedForUser,
    appointmentRemovedForFreelancer
} = appointmentSlice.actions

export default appointmentSlice.reducer