/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { VNodeChild } from 'vue';
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

function buildDropdown(item: DomainEntityNavItem, path: string) {
    const expand = ref(false);

    const components = item.components || [];

    return h('li', {
        class: 'nav-item dropdown',
    }, [
        h('a', {
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
            h('i', { class: `${item.icon} pe-1` }),
            item.name,
        ]),
        h('ul', { class: 'dropdown-menu' }, [
            ...components.map((component) => h('li', [
                buildLinkNode(component, buildLink(path, item.urlSuffix), 'dropdown-item'),
            ])),
        ]),
    ]);
}

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

    switch (options.direction) {
        case 'vertical':
            clazz.push('flex-column');
            break;
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
                    return buildDropdown(item, path);
                }

                return h('li', { class: 'nav-item' }, [
                    buildLinkNode(item, path),
                ]);
            }),
        ],
    );
}
