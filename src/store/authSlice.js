import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    userInfo: {},
    appointments:[],
    loggedIn: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        login(state){
            state.loggedIn = true;
        },
        userInfo(state, info){
            state.userInfo = info.user;
            state.appointments = info.appointments
            state.notifications = info.notifications
        },
        logout(state){
            state.currentUser = {};
            state.loggedIn=false;
        }
    }

})


export const {login, userInfo, logout} = authSlice.actions
export default authSlice.reducer