const path = require('path');

module.exports = {
    resolve: {
        // for WebStorm, remove this after refactoring
        alias: {
            '@': path.resolve(__dirname),
            '~': path.resolve(__dirname),
        }
    },
};
