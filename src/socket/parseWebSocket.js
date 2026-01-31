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