/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type DockerPullOptions = {
    authconfig: {
        username: string,
        password: string,
        serveraddress: string
    }
};

// -------------------------------------------------------

export type DockerPushImage = {
    tag?: string,
    name: string
};

export type DockerPushImageOptions = {
    remove?: boolean
};
// -------------------------------------------------------

export type DockerContainerFileType = 'file' | 'link' | 'symlink' | 'directory' |
'block-device' | 'character-device' | 'fifo' | 'contiguous-file';

export type DockerContainerFile = {
    name: string,
    path?: string,
    type: DockerContainerFileType,
    size: number,
    content: string
};
