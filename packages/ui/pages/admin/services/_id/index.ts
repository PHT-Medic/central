/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { PropType } from 'vue';
import { ServiceID } from '@personalhealthtrain/central-common';
import RegistryManagement from '../../../../components/domains/master-image/MasterImagesSync';
import StationRegistryManagement from '../../../../components/domains/service/StationRegistryManagement';

export default Vue.extend({
    props: {
        entityId: String as PropType<ServiceID>,
    },
    render(h) {
        if (this.entityId === ServiceID.REGISTRY) {
            return h(RegistryManagement, {
                props: {
                    entityId: this.entityId,
                },
                on: {
                    updated: (event) => this.$emit('updated', event),
                },
            });
        }

        if (this.entityId === ServiceID.STATION_REGISTRY) {
            return h(StationRegistryManagement, {
                props: {
                    entityId: this.entityId,
                },
            });
        }

        return h('div', {
            class: 'alert alert-info alert-sm',
        }, `You can not execute any task for the ${this.entityId} service yet.`);
    },
});
