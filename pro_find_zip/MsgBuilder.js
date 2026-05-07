export default function MsgBuild(type, payload,token,type_of_data="JSON"){
    const my_dict = {
        "type": type,
        "data": payload,
        "data_type":type_of_data,
        "token":token
    }
    return JSON.stringify(my_dict)
}