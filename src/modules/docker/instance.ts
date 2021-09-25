import Docker from "dockerode";

let dockerInstance : Docker | undefined;

export function useDocker(): Docker {
    if (typeof dockerInstance !== 'undefined') {
        return dockerInstance;
    }

    dockerInstance = new Docker();
    return dockerInstance;
}
