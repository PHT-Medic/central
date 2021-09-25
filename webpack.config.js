const path = require('path');

module.exports = {
    resolve: {
        // for WebStorm, remove this after refactoring
        alias: {
            '@': path.resolve(__dirname, 'packages/frontend'),
            '~': path.resolve(__dirname, 'packages/frontend'),
        }
    }
};
