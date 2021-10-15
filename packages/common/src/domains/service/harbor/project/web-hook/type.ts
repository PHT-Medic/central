/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type HarborProjectWebhookOptions = {
    internalAPIUrl?: string
    externalAPIUrl?: string
}

export type HarborProjectWebhookEventType =
    'PUSH_ARTIFACT' | 'PULL_ARTIFACT' | 'DELETE_ARTIFACT' |
    'DELETE_CHART' | 'DOWNLOAD_CHART' | 'UPLOAD_CHART' |
    'QUOTA_EXCEEDED' | 'QUOTA_WARNING' |
    'REPLICATION' |
    'SCANNING_FAILED' | 'SCANNING_COMPLETED' |
    'TAG_RETENTION';

export type HarborProjectWebhookTarget = {
    address: string;
    auth_header?: string;
    skip_cert_verify: boolean;
    type: 'http';
}

export type HarborProjectWebhook = {
    creation_time?: string;
    description?: string;
    enabled: true;
    event_types: HarborProjectWebhookEventType[];
    id?: number;
    name: string;
    project_id?: number;
    targets: HarborProjectWebhookTarget[];
    update_time?: string;
}
