/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { compileToFunctions } from 'vue-template-compiler';
import Vue from 'vue';
import { WorldTemplate } from './WorldTemplate';

const templateCompiled = compileToFunctions(WorldTemplate);

export default Vue.extend({
    props: {
        width: {
            type: [Number, String],
            default: 750,
        },
        height: {
            type: [Number, String],
            default: 500,
        },
    },
    render: templateCompiled.render,
    staticRenderFns: templateCompiled.staticRenderFns,
});
