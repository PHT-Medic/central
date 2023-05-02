/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Station } from '@personalhealthtrain/central-common';
import {
    Ecosystem,
} from '@personalhealthtrain/central-common';
import RobotDetails from '../robot/RobotDetails';

export default defineComponent({
    name: 'StationRobotDetails',
    props: {
        entity: {
            type: Object as PropType<Station>,
            required: true,
        },
    },
    setup(props) {
        if (props.entity.ecosystem !== Ecosystem.DEFAULT) {
            return () => h(
                'div',
                { staticClass: 'alert alert-sm alert-danger' },
                [
                    'The robot creation is only permitted for the default ecosystem.',
                ],
            );
        }

        return () => h(RobotDetails, {
            where: {
                name: props.entity.id,
                realm_id: props.entity.realm_id,
            },
        });
    },
});
