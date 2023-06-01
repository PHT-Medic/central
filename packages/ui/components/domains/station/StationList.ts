/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { BuildInput } from 'rapiq';
import type { Station } from '@personalhealthtrain/central-common';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type {
    DomainListHeaderSearchOptionsInput,
    DomainListHeaderTitleOptionsInput,
} from '../../../core';
import {
    createDomainListBuilder,
} from '../../../core';

export default defineComponent({
    name: 'StationList',
    props: {
        loadOnSetup: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<Station>>,
            default() {
                return {};
            },
        },
        noMore: {
            type: Boolean,
            default: true,
        },
        footerPagination: {
            type: Boolean,
            default: true,
        },
        headerTitle: {
            type: [Boolean, Object] as PropType<boolean | DomainListHeaderTitleOptionsInput>,
            default: true,
        },
        headerSearch: {
            type: [Boolean, Object] as PropType<boolean | DomainListHeaderSearchOptionsInput>,
            default: true,
        },
    },
    setup(props, ctx) {
        const { build } = createDomainListBuilder<Station>({
            props: toRefs(props),
            setup: ctx,
            load: (buildInput) => useAPI().station.getMany(buildInput),
            query: {
                sort: {
                    name: 'ASC',
                },
            },
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Stations',
                    icon: 'fa fa-house-medical',
                },

                noMore: {
                    textContent: 'No more stations available...',
                },
            },
        });

        return () => build();
    },
});
