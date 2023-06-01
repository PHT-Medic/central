/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineComponent, ref } from 'vue';
import type { PropType, VNodeChild } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { NuxtLink } from '#components';

export type DomainEntityNavItem = {
    name: string,
    icon: string,
    urlSuffix: string,
    components?: DomainEntityNavItem[]
};

export type DomainEntityNavItems = DomainEntityNavItem[];

export type DomainEntityNavOptions = {
    direction?: 'vertical' | 'horizontal',
    prevLink?: boolean
};

function buildLink(path: string, link: string) {
    if (link.length === 0) {
        return path;
    }

    if (link.substring(0, 1) === '/') {
        return `${path}${link}`;
    }

    return `${path}/${link}`;
}

function buildLinkNode(
    item: DomainEntityNavItem,
    path: string,
    clazz?: string,
) {
    return h(
        NuxtLink,
        {
            class: clazz || 'nav-link',
            to: buildLink(path, item.urlSuffix),
        },
        {
            default: () => [
                h('i', { class: `${item.icon} pe-1` }),
                item.name,
            ],
        },
    );
}

const dropdown = defineComponent({
    props: {
        item: {
            type: Object as PropType<DomainEntityNavItem>,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const refs = toRefs(props);

        const expand = ref(false);

        const components = refs.item.value.components || [];

        const linkRef = ref(null);

        onClickOutside(linkRef, () => {
            expand.value = false;
        });

        return () => h('li', {
            class: 'nav-item dropdown',
        }, [
            h('a', {
                ref: linkRef,
                class: [
                    'nav-link dropdown-toggle',
                    {
                        show: expand.value,
                    },
                ],
                href: '#',
                onClick($event: any) {
                    $event.preventDefault();

                    expand.value = !expand.value;
                },
            }, [
                h('i', { class: `${refs.item.value.icon} pe-1` }),
                refs.item.value.name,
            ]),
            h('ul', {
                class: ['dropdown-menu', {
                    show: expand.value,
                }],
            }, [
                ...components.map((component) => h('li', [
                    buildLinkNode(component, buildLink(refs.path.value, refs.item.value.urlSuffix), 'dropdown-item'),
                ])),
            ]),
        ]);
    },
});
export function buildDomainEntityNav(
    path: string,
    items: DomainEntityNavItem[],
    options?: DomainEntityNavOptions,
) {
    const lastIndex = path.lastIndexOf('/');
    const basePath = path.substring(0, lastIndex);

    options = options || {};

    const clazz : string[] = [
        'nav nav-pills',
    ];

    if (options.direction === 'vertical') {
        clazz.push('flex-column');
    }

    let prevLink : VNodeChild = [];
    if (options.prevLink) {
        prevLink = h('li', { class: 'nav-item' }, [
            h(
                NuxtLink,
                {
                    class: 'nav-link',
                    to: basePath,
                },
                {
                    default: () => [
                        h('i', { class: 'fa fa-arrow-left' }),
                    ],
                },
            ),
        ]);
    }

    return h(
        'ul',
        { class: clazz },
        [
            prevLink,
            ...items.map((item) => {
                if (item.components) {
                    return h(dropdown, {
                        item,
                        path,
                    });
                }

                return h('li', { class: 'nav-item' }, [
                    buildLinkNode(item, path),
                ]);
            }),
        ],
    );
}
