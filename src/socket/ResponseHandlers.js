//Returns true if server logged in and false if not
export const handleLoginResponse = (payload) =>{
    if (payload.data.status == "Logged")
        return true;
    else if (payload.data.status == "Failed")
        return false;
    else
        console.log("Unknown response")
}