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
