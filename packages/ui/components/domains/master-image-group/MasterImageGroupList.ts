/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { MasterImageGroup } from '@personalhealthtrain/central-common';
import type { BuildInput } from 'rapiq';
import { createDomainListBuilder } from '../../../core';
import type {
    DomainListHeaderSearchOptionsInput,
    DomainListHeaderTitleOptionsInput,
} from '../../../core';

export default defineComponent({
    name: 'MasterImageGroupList',
    props: {
        loadOnSetup: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<MasterImageGroup>>,
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
        const { build } = createDomainListBuilder<MasterImageGroup>({
            props: toRefs(props),
            setup: ctx,
            load: (buildInput) => useAPI().masterImageGroup.getMany(buildInput),
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Master Image Groups',
                },

                noMore: {
                    textContent: 'No more master-image-groups available...',
                },
            },
        });

        return () => build();
    },
});
