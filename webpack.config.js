/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

const path = require('path');

module.exports = {
    resolve: {
        // for WebStorm, remove this after refactoring
        alias: {
            '@personalhealthtrain/ui-common': path.resolve(__dirname, 'packages/common/src'),
            '@': path.resolve(__dirname, 'packages/frontend'),
            '~': path.resolve(__dirname, 'packages/frontend'),
        }
    }
};
