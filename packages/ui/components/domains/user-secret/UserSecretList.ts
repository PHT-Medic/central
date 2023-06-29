/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { UserSecret } from '@personalhealthtrain/central-common';
import { SecretType } from '@personalhealthtrain/central-common';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type {
    DomainListSlotsType,
} from '../../../core';
import {
    createDomainListBuilder, defineDomainListEvents, defineDomainListProps,
} from '../../../core';

export default defineComponent({
    props: defineDomainListProps<UserSecret>(),
    slots: Object as SlotsType<DomainListSlotsType<UserSecret>>,
    emits: defineDomainListEvents<UserSecret>(),
    setup(props, ctx) {
        const { build } = createDomainListBuilder<UserSecret>({
            props,
            setup: ctx,
            load: (buildInput) => useAPI().userSecret.getMany(buildInput),
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Secrets',
                    icon: 'fa fa-key',
                },

                item: {
                    icon: false,
                    content(item, props, sections) {
                        if (sections.slot) {
                            return sections.slot;
                        }

                        return [
                            h(
                                'div',
                                {
                                    class: ['badge badge-pill', {
                                        'bg-primary': item.type === SecretType.RSA_PUBLIC_KEY,
                                        'bg-dark': item.type === SecretType.PAILLIER_PUBLIC_KEY,
                                    }],
                                },
                                [
                                    (item.type === SecretType.PAILLIER_PUBLIC_KEY ? 'Paillier' : 'RSA'),
                                ],
                            ),
                            h(
                                'div',
                                {
                                    class: 'ms-1',
                                },
                                [item.key],
                            ),
                            sections.actions,
                        ];
                    },
                },

                noMore: {
                    content: 'No more secrets available...',
                },
            },
        });

        return () => build();
    },
});
