import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    userToken: "",
    userInfo: {},
    appointments:[],
    loggedIn: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        login(state, info){
            state.loggedIn = true;
            state.userToken = info.payload;
        },
        setUserInfo(state, info){
            state.userInfo = info.user
            state.appointments = info.appointments
            state.notifications = info.notifications
        },
        logout(state){
            state.usesrInfo = {};
            state.userToken = "";
            state.appointments = {};
            state.loggedIn=false;
        }
    }

})


export const {login, userInfo, logout} = authSlice.actions
export default authSlice.reducer