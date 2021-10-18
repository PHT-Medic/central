/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum RegistryCommand {
    PROJECT_PULL = 'harborProjectPull',
    PROJECT_CREATE = 'harborProjectCreate',
    PROJECT_DROP = 'harborProjectDrop',
    PROJECT_REPOSITORIES_SYNC = 'harborProjectSync',

    PROJECT_ROBOT_ACCOUNT_CREATE = 'harborProjectRobotAccountCreate',
    PROJECT_ROBOT_ACCOUNT_DROP = 'harborProjectRobotAccountDrop',

    PROJECT_WEBHOOK_CREATE = 'harborProjectWebHookCreate',
    PROJECT_WEBHOOK_DROP = 'harborProjectWebhookDrop'
}

export type RegistryCommandType = `${RegistryCommand}`;
