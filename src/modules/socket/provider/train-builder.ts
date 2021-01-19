import ioClient from 'socket.io-client';
import env from "../../../env";

let instance : undefined | SocketIOClient.Socket;

export function useTrainBuilderSocket() {
    if(typeof instance !== 'undefined') {
        return instance;
    }

    let url : undefined | string = env.trainBuilderSocketUrl;

    console.log('Connecting to TrainBuilder: ' + url);
    instance = ioClient(url);
    instance.on('connect_failed', function() {
        console.log("Connecting to TrainBuilder failed.");
    })


    return instance;
}
