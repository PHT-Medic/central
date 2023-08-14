/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';
import type { RegistryProject, Station } from '@personalhealthtrain/core';
import {
    Ecosystem,
} from '@personalhealthtrain/core';
import RegistryProjectDetails from '../registry-project/RegistryProjectEntity';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Station>,
            required: true,
        },
    },
    emits: ['resolved', 'failed', 'updated'],
    setup(props, { emit }) {
        if (props.entity.ecosystem !== Ecosystem.DEFAULT) {
            return () => h(
                'div',
                { class: 'alert alert-sm alert-danger' },
                [
                    'The registry creation is only permitted for the default ecosystem.',
                ],
            );
        }

        if (!props.entity.registry_id) {
            return () => h(
                'div',
                { class: 'alert alert-sm alert-warning' },
                [
                    'The station has not been assigned to a registry yet.',
                ],
            );
        }

        if (!props.entity.registry_project_id) {
            return () => h(
                'div',
                { class: 'alert alert-sm alert-warning' },
                [
                    'No related registry-resource exists at the moment.',
                    ' ',
                    'To create one, execute the update operation after a registry is selected.',
                ],
            );
        }

        return () => h(
            RegistryProjectDetails,
            {
                entityId: props.entity.registry_project_id as string,
                onUpdated: (entity: RegistryProject) => {
                    emit('updated', {
                        registry_project_id: entity.id,
                        registry_project: entity,
                    });
                },
                onFailed: (e) => {
                    emit('failed', e);
                },
                onResolved: (entity?: RegistryProject) => {
                    if (!entity) { return; }

                    emit('updated', {
                        registry_project_id: entity.id,
                        registry_project: entity,
                    });
                },
            },
        );
    },
});
