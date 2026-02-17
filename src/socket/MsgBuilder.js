export default function MsgBuild(type, payload, type_of_data){
    const my_dict = {
        "type": type,
        "data": payload,
        "data_type":type_of_data
    }
    return JSON.stringify(my_dict)
}