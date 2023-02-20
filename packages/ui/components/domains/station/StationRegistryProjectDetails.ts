/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CreateElement, PropType, VNode } from 'vue';
import Vue from 'vue';
import type { RegistryProject, Station } from '@personalhealthtrain/central-common';
import {
    Ecosystem,
} from '@personalhealthtrain/central-common';
import RegistryProjectDetails from '../registry-project/RegistryProjectDetails';

type Properties = {
    entity: Station
};

export default Vue.extend<any, any, any, Properties>({
    name: 'StationRegistryProjectDetails',
    props: {
        entity: Object as PropType<Station>,
    },
    methods: {
        handleUpdated(item: RegistryProject) {
            this.$emit('updated', {
                registry_project_id: item.id,
                registry_project: item,
            });
        },
    },
    render(h: CreateElement): VNode {
        const vm = this;

        if (vm.entity.ecosystem !== Ecosystem.DEFAULT) {
            return h(
                'div',
                { staticClass: 'alert alert-sm alert-danger' },
                [
                    'The registry creation is only permitted for the default ecosystem.',
                ],
            );
        }

        if (!vm.entity.registry_id) {
            return h(
                'div',
                { staticClass: 'alert alert-sm alert-warning' },
                [
                    'The station has not been assigned to a registry yet.',
                ],
            );
        }

        if (!vm.entity.registry_project_id) {
            return h(
                'div',
                { staticClass: 'alert alert-sm alert-warning' },
                [
                    'No related registry-resource exists at the moment.',
                    ' ',
                    'To create one, execute the update operation after a registry is selected.',
                ],
            );
        }

        return h(
            RegistryProjectDetails,
            {
                props: {
                    entityId: vm.entity.registry_project_id,
                },
                on: {
                    resolved(item) {
                        vm.handleUpdated.call(null, item);
                    },
                },
            },
        );
    },
});
