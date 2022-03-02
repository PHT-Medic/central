/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { CreateElement, VNode } from 'vue';

export const AssignmentToggleButton = Vue.extend({
    name: 'AssignmentToggleButton',
    props: {
        id: {
            type: [String, Number],
            default: undefined,
        },
        ids: Array,
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        isSelected() {
            return Array.isArray(this.ids) ?
                this.ids.indexOf(this.id) !== -1 : false;
        },
    },
    methods: {
        toggle() {
            this.$emit('toggle', this.id);
        },
    },
    render(h: CreateElement): VNode {
        const vm = this;

        return h('button', {
            staticClass: 'btn btn-xs',
            class: {
                'btn-warning': vm.isSelected,
                'btn-success': !vm.isSelected,
            },
            attrs: {
                type: 'button',
            },
            on: {
                click($event: any) {
                    $event.preventDefault();

                    return vm.toggle.apply(null);
                },
            },
        }, [
            h('i', {
                staticClass: 'fa',
                class: {
                    'fa-plus': !vm.isSelected,
                    'fa-minus': vm.isSelected,
                },
            }),
        ]);
    },
});
