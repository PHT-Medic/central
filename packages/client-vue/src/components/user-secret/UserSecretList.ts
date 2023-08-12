/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { UserSecret } from '@personalhealthtrain/central-common';
import { DomainType, SecretType } from '@personalhealthtrain/central-common';
import type { SlotsType } from 'vue';
import { defineComponent, h } from 'vue';
import { createEntityList, defineDomainListEvents, defineDomainListProps } from '../../core';
import type { EntityListSlotsType } from '../../core';

export default defineComponent({
    props: defineDomainListProps<UserSecret>(),
    slots: Object as SlotsType<EntityListSlotsType<UserSecret>>,
    emits: defineDomainListEvents<UserSecret>(),
    setup(props, setup) {
        const { render, setDefaults } = createEntityList({
            type: `${DomainType.USER_SECRET}`,
            props,
            setup,
        });

        setDefaults({
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
        });

        return () => render();
    },
});
