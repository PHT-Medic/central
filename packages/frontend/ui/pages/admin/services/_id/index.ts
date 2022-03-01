/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { PropType } from 'vue';
import { ServiceID } from '@personalhealthtrain/central-common';
import RegistryManagement from '../../../../components/domains/service/harbor/HarborManagement.vue';

export default Vue.extend({
    props: {
        serviceId: Object as PropType<ServiceID>,
    },
    render(createElement) {
        let template : any = createElement();

        // eslint-disable-next-line default-case
        switch (this.serviceId) {
            case ServiceID.REGISTRY:
                template = RegistryManagement;
                break;
        }

        if (!template) {
            return createElement('div', {
                class: 'alert alert-info alert-sm',
            }, `You can not execute any task for the ${this.serviceId} service yet.`);
        }

        return createElement(template, {
            props: {
                serviceId: this.serviceId,
            },
            on: {
                updated: (event) => this.$emit('updated', event),
            },
        });
    },
});
