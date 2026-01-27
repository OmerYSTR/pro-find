import { createSlice } from '@reduxjs/toolkit'
import { createElement } from 'react'

const initalState = {
    connected: false,
    lastMessage: null
}


const socketSlice = createSlice({
    name:'socket',
    initalState,
    reducers:{
        setConnected(state, action){
            state.connected = action.payload
        },
        setDisconnected(state){
            state.connected = false
        },
        setLastMessage(state, action){
            state.lastMessage = action.payload
        }
    }
})

export const [setConnected, setDisconnected, setLastMessage] = socketSlice.actions
export default socketSlice.reducer