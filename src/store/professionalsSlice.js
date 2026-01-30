import { createSlice } from '@reduxjs/toolkit'


const initialState ={
    list: [],
    filter: {}
}

const professionalSlice =createSlice({
    name:"professionals",
    initialState,
    reducers:{
        professionalRecvd(state, action){
            state.list = action.payload
        },
        setFilter(state, action){
            state.filter = action.payload
        }
    }
})

export const {professionalRecvd, setFilter} = professionalSlice.actions
export default professionalSlice.reducer