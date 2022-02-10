/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainCommand } from '@personalhealthtrain/ui-common';

export enum SpecialTrainCommand {
    RESULT_DOWNLOAD = 'resultDownload',
}

export const FrontendTrainCommand = {
    ...TrainCommand,
    ...SpecialTrainCommand,
};
