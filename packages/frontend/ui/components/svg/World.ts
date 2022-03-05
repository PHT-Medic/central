/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue from 'vue';
import {WorldTemplate} from "./WorldTemplate";

const compiled = Vue.compile(WorldTemplate);

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
    render: compiled.render,
    staticRenderFns: compiled.staticRenderFns
});
