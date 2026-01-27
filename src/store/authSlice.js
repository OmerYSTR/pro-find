import {createSlice} from '@reduxjs/toolkit'

const initalState = {
    currentUser: null,
    loggedIn: false
}

const authSlice = createSlice({
    name: "auth",
    initalState,
    reducers:{
        login(state, action){
            state.currentUser = action.payload;
            state.loggedIn = true;
        },
        logout(state){
            state.currentUser = null;
            state.loggedIn=false;
        }
    }

})


export const {login, logout} = authSlice.actions
export default authSlice.reducer