/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type HarborProjectArtifactTag = {
    artifact_id: number,
    id: number,
    immutable: boolean,
    name: string,
    pull_time: string,
    push_time: string,
    repository_id: number,
    signed: boolean
};

export type HarborProjectArtifactLabel = {
    id: number,
    name: string,
    scope: string,
    update_time: string,
    creation_time: string
};

export type HarborProjectArtifact = {
    size: number,
    push_time: string,
    pull_time: string,
    tags?: HarborProjectArtifactTag[],
    labels?: HarborProjectArtifactLabel[],
    digest: string,
    id?: number,
    type: 'IMAGE' | 'CHART' | string,
    project_id: number,
    repository_id: number,
};
