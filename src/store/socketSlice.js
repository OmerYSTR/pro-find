import { createSlice } from '@reduxjs/toolkit'
import { createElement } from 'react'

const initialState = {
    connected: false,
    lastMessage: null
}


const socketSlice = createSlice({
    name:'socket',
    initialState,
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

export const {setConnected, setDisconnected, setLastMessage} = socketSlice.actions
export default socketSlice.reducer