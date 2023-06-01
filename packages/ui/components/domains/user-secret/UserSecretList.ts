/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { UserSecret } from '@personalhealthtrain/central-common';
import { SecretType } from '@personalhealthtrain/central-common';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { BuildInput } from 'rapiq';
import type {
    DomainListHeaderSearchOptionsInput,
    DomainListHeaderTitleOptionsInput,
} from '../../../core';
import {
    createDomainListBuilder,
} from '../../../core';

export default defineComponent({
    props: {
        loadOnSetup: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<UserSecret>>,
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
        const { build } = createDomainListBuilder<UserSecret>({
            props: toRefs(props),
            setup: ctx,
            load: (buildInput) => useAPI().userSecret.getMany(buildInput),
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Secrets',
                    icon: 'fa fa-key',
                },

                items: {
                    item: {
                        textFn(item) {
                            return [
                                h(
                                    'span',
                                    {
                                        class: ['badge badge-pill', {
                                            'badge-primary': item.type === SecretType.RSA_PUBLIC_KEY,
                                            'badge-dark': item.type === SecretType.PAILLIER_PUBLIC_KEY,
                                        }],
                                    },
                                    [
                                        (item.type === SecretType.PAILLIER_PUBLIC_KEY ? 'Paillier' : 'RSA'),
                                    ],
                                ),
                                h(
                                    'span',
                                    {
                                        class: 'ml-1',
                                    },
                                    [item.key],
                                ),
                            ];
                        },
                    },
                },

                noMore: {
                    textContent: 'No more secrets available...',
                },
            },
        });

        return () => build();
    },
});
