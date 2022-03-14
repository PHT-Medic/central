/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import AuthVue from '@authelion/vue';
import { Pagination } from '@vue-layout/utils';
import Vue from 'vue';
import Gravatar from 'vue-gravatar';
import EntityDelete from '../components/domains/EntityDelete';

Vue.use(AuthVue);
Vue.component('Pagination', Pagination);
Vue.component('VGravatar', Gravatar);
Vue.component('EntityDelete', EntityDelete);
Vue.filter('str_length_limit', (value, size) => {
    if (!value) return '';
    value = value.toString();

    if (value.length <= size) {
        return value;
    }
    return `${value.substr(0, size)}...`;
});
