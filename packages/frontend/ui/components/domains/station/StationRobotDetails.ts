/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Robot } from '@authup/common';
import Vue, { CreateElement, PropType, VNode } from 'vue';
import {
    Ecosystem,
    Station, buildStationRobotName,
} from '@personalhealthtrain/central-common';
import RobotDetails from '../robot/RobotDetails';

type Properties = {
    entity: Station
};

export default Vue.extend<any, any, any, Properties>({
    name: 'StationRobotDetails',
    props: {
        entity: Object as PropType<Station>,
    },
    methods: {
        handleUpdated(item: Robot) {
            // do: nothing
        },
    },
    render(h: CreateElement): VNode {
        const vm = this;

        if (vm.entity.ecosystem !== Ecosystem.DEFAULT) {
            return h(
                'div',
                { staticClass: 'alert alert-sm alert-danger' },
                [
                    'The robot creation is only permitted for the default ecosystem.',
                ],
            );
        }

        return h(
            RobotDetails,
            {
                props: {
                    where: {
                        name: buildStationRobotName(vm.entity.external_name),
                        realm_id: vm.entity.realm_id,
                    },
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
