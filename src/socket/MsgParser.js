//Messages are sent in this format:
//{
//  type: type of message...
//  data: actual payload of the message, if more then one field then sent as a dict
//  data_type: BYTES or JSON
//}


export default function webSocketParser(payload)
{
    try{
        const msgObj = JSON.parse(payload);
        const {type, data, data_type} = msgObj; 
        let parsedData = data
        if (data_type == "BYTES"){
            const binaryStr = atob(data);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i=0; i<binaryStr.length; i++){
                bytes[i] = binaryStr.charCodeAt(i);
            }
            parsedData = bytes;
        }

        return {type, data:parsedData};
    } catch(err){
        console.error("Failed to parse message", err);
        return null;
    }
}
