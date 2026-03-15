import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    userToken: "",
    userInfo: {},
    loggedIn: false,
    notifications: []
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
            state.userInfo = info.payload.user
            state.notifications = info.payload.notifications
        },
        logout(state){
            state.usesrInfo = {};
            state.userToken = "";
            state.loggedIn=false;
        }
    }

})


export const {login, setUserInfo, logout} = authSlice.actions
export default authSlice.reducer