/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue from 'vue'
import {createTimeago} from 'vue-timeago';

const Component = createTimeago({
    locale: 'en'
});

const $timeago = {
    locale: 'en'
};

Vue.prototype.$timeago = Vue.observable ? Vue.observable($timeago) : new Vue({
    data: $timeago
});

Vue.component('timeago', Component);
