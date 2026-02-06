//#region imports
import { 
    appointmentRecvd, 
    appointmentAddedForUser, 
    appointmentAddedForFreelancer, 
    appointmentRemovedForUser, 
    appointmentRemovedForFreelancer } 
from '../store/appointmentsSlice.js'
import {login, logout} from '../store/authSlice.js'
import { professionalRecvd,setFilter } from '../store/professionalsSlice.js'
//#endregion


let MessageTypes = Object.freeze({
  USER_INFO: 'USRINFO',
  GET_APPOINTMENTS: 'GETAPPOINT',
  NEW_APPOINTMENT_USER_RECEIVED: 'UPDATE_APPOINT_USER',
  NEW_APPOINTMENT_FREELANCER_RECEIVED: 'UPDATE_APPOINT_FREELANCER',
  REMOVED_APPOINTMENT_USER: 'APPOINT_REMOVED_USER',
  REMOVED_APPOINTMENT_FREELANCER: 'APPOINT_REMOVED_FREELANCER',
  PROFESSIONAL_LIST: 'PRO_LIST',
  PROFESSIONAL_FILTER: 'PRO_FILTER',
});



const messageHandlers= {
    [MessageTypes.USER_INFO]: (payload, dispatch) => dispatch(login(payload)),
    [MessageTypes.GET_APPOINTMENTS]: (payload, dispatch) =>dispatch(appointmentRecvd(payload)),
    [MessageTypes.NEW_APPOINTMENT_USER_RECEIVED]: (payload, dispatch) =>dispatch(appointmentAddedForUser(payload)),
    [MessageTypes.NEW_APPOINTMENT_FREELANCER_RECEIVED]: (payload, dispatch) =>dispatch(appointmentAddedForFreelancer(payload)),
    [MessageTypes.REMOVED_APPOINTMENT_USER]: (payload,dispatch) =>dispatch(appointmentRemovedForUser(payload)),
    [MessageTypes.REMOVED_APPOINTMENT_FREELANCER]: (payload, dispatch) =>dispatch(appointmentRemovedForFreelancer(payload)),
    [MessageTypes.PROFESSIONAL_LIST]: (payload, dispatch) => dispatch(professionalRecvd(payload)),
    [MessageTypes.PROFESSIONAL_FILTER]: (payload, dispatch) => dispatch(setFilter(payload))
};


export const handleCase = (type, payload, dispatch) =>{
    const handler = messageHandlers[type];

    if (!handler){console.warn("Unknown message type"); return;}

    handler(payload, dispatch);
}