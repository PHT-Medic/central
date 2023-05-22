/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { MasterImage } from '@personalhealthtrain/central-common';
import type { BuildInput } from 'rapiq';
import { createDomainListBuilder } from '../../../core';
import type {
    DomainListHeaderSearchOptionsInput,
    DomainListHeaderTitleOptionsInput,
} from '../../../core';

export default defineComponent({
    name: 'MasterImageList',
    props: {
        loadOnSetup: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<MasterImage>>,
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
        const { build } = createDomainListBuilder<MasterImage>({
            props: toRefs(props),
            setup: ctx,
            load: (buildInput) => useAPI().masterImage.getMany(buildInput),
            queryFilter: (q) => ({
                path: q.length > 0 ? `~${q}` : q,
            }),
            query: {
                sort: {
                    path: 'ASC',
                },
            },
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Master Images',
                    icon: 'fa fa-compact-disc',
                },

                items: {
                    item: {
                        textPropName: 'virtual_path',
                    },
                },

                noMore: {
                    textContent: 'No more master-images available...',
                },
            },
        });

        return () => build();
    },
});
