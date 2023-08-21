/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { UserSecret } from '@personalhealthtrain/core';
import { DomainType, SecretType } from '@personalhealthtrain/core';
import type { SlotsType } from 'vue';
import { defineComponent, h } from 'vue';
import { createList, defineListEvents, defineListProps } from '../../core';
import type { ListSlotsType } from '../../core';

export default defineComponent({
    props: defineListProps<UserSecret>(),
    slots: Object as SlotsType<ListSlotsType<UserSecret>>,
    emits: defineListEvents<UserSecret>(),
    setup(props, setup) {
        const { render, setDefaults } = createList({
            type: `${DomainType.USER_SECRET}`,
            props,
            setup,
        });

        setDefaults({
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
