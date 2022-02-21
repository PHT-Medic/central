/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientDriverInstance } from '@trapi/client';
import { HarborRobotAccount } from './type';
import { buildHarborRobotAccountPermissionForNamespace } from './utils';
import { mergeDeep } from '../../../utils';

export class HarborRobotAccountAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async find(
        name: string,
        withSecret = true,
    ): Promise<HarborRobotAccount | undefined> {
        const { data } = await this.client.get(`robots?q=name%3D${name}&page_size=1`);

        const accounts = Array.isArray(data) ? data.filter((account) => account.name === `robot$${name}`) : [];

        if (
            accounts.length === 1
        ) {
            let secret: string | undefined;

            if (withSecret) {
                const patchedAccount = await this.refreshSecret(accounts[0].id);
                secret = patchedAccount.secret;
            }

            return {
                id: accounts[0].id,
                name: accounts[0].name,
                creation_time: accounts[0].creation_time,
                expires_at: accounts[0].expires_at,
                secret,
            };
        }

        return undefined;
    }

    /**
     * Update harbor project robot account.
     * If no "record.secret" provided, a new secret is generated.
     *
     * @param robotId
     * @param secret
     */
    async refreshSecret(
        robotId: string | number,
        secret?: string,
    ): Promise<Pick<HarborRobotAccount, 'secret'>> {
        const payload: Record<string, any> = {
            ...(secret ? { secret } : {}),
        };

        const { data }: { data: HarborRobotAccount } = await this.client
            .patch(`robots/${robotId}`, payload);

        if (typeof payload.secret !== 'undefined') {
            data.secret = payload.secret;
        }

        return data as Pick<HarborRobotAccount, 'secret'>;
    }

    async update(
        id: string | number,
        namespace: string,
        payload?: Partial<HarborRobotAccount>,
    ): Promise<Partial<HarborRobotAccount>> {
        payload = mergeDeep({
            id,
            description: '',
            duration: -1,
            level: 'system',
            editable: true,
            disable: false,
            permissions: [buildHarborRobotAccountPermissionForNamespace(namespace)],
        }, (payload || {}));

        await this.client
            .put(`robots/${id}`, payload);

        return payload;
    }

    async create(robotName: string, projectName?: string) {
        const payload: HarborRobotAccount = {
            name: robotName,
            duration: -1,
            level: 'system',
            disable: false,
            permissions: [buildHarborRobotAccountPermissionForNamespace(projectName ?? robotName)],
        };

        const { data }: { data: HarborRobotAccount } = await this.client
            .post('robots', payload);

        return data;
    }

    async delete(robotId: string | number): Promise<void> {
        await this.client
            .delete(`robots/${robotId}`);
    }
}
