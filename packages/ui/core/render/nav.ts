/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineComponent, ref } from 'vue';
import type { MaybeRef, PropType, VNodeChild } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { NuxtLink } from '#components';

export type NavItem = {
    name: string,
    icon: string,
    urlSuffix: string,
    components?: NavItem[]
};

export type NavItems = NavItem[];

export type NavOptions = {
    direction?: MaybeRef<'vertical' | 'horizontal'>,
    prevLink?: MaybeRef<boolean>
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

type LinkNodeOptions = {
    clazz?: string
};
function buildLinkNode(
    item: NavItem,
    path: string,
    options: LinkNodeOptions = {},
) {
    const to = buildLink(path, item.urlSuffix);

    return h(
        NuxtLink,
        {
            class: [unref(options.clazz) || 'nav-link'],
            to,
        },
        {
            default: () => [
                h('i', { class: `${item.icon}` }),
                ' ',
                item.name,
            ],
        },
    );
}

const dropdown = defineComponent({
    props: {
        item: {
            type: Object as PropType<NavItem>,
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
                    buildLinkNode(
                        component,
                        buildLink(
                            refs.path.value,
                            refs.item.value.urlSuffix,
                        ),
                        {
                            clazz: 'dropdown-item',
                        },
                    ),
                ])),
            ]),
        ]);
    },
});

type RenderFn = () => VNodeChild;
export function createNavRenderFn(
    path: string,
    items: NavItem[],
    options?: NavOptions,
) : RenderFn {
    const lastIndex = path.lastIndexOf('/');
    const basePath = path.substring(0, lastIndex);

    options = options || {};

    const clazz = computed(() => {
        const output = ['nav nav-pills'];
        const direction = unref(options?.direction);
        if (direction === 'vertical') {
            output.push('flex-column');
        }

        return output;
    });

    const prevLinkEnabled = unref(options.prevLink);

    let prevLink : VNodeChild = [];
    if (prevLinkEnabled) {
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

    return () => h(
        'ul',
        { class: clazz.value },
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
                    buildLinkNode(item, path, {}),
                ]);
            }),
        ],
    );
}
