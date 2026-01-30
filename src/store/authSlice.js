import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    currentUser: {},
    loggedIn: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        login(state, action){
            state.currentUser = action.payload;
            state.loggedIn = true;
        },
        logout(state){
            state.currentUser = {};
            state.loggedIn=false;
        }
    }

})


export const {login, logout} = authSlice.actions
export default authSlice.reducer