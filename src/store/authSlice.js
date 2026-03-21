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
            state.userInfo = {};
            state.userToken = "";
            state.loggedIn=false;
            state.notifications=[];
        }
    }

})


export const {login, setUserInfo, logout} = authSlice.actions
export default authSlice.reducer