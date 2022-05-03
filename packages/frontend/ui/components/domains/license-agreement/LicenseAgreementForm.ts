/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { CreateElement, VNode } from 'vue';

export default Vue.extend<any, any, any, any>({
    name: 'LicenseAgreementForm',
    data() {
        return {
            busy: false,
        };
    },
    methods: {
        async submit() {
            if (this.busy) {
                return;
            }

            this.busy = true;

            try {
                const userAttribute = await this.$authApi.userAttribute.create({
                    key: 'license_agreement',
                    value: 'accepted',
                });

                this.$emit('accepted', userAttribute);
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },
        decline() {
            this.$emit('declined');
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const h = createElement;

        const info = h('div', {
            staticClass: 'alert alert-sm alert-danger',
        }, [
            'It is necessary to accept the license agreement',
            ' in order to be able to use the application in its entirety.',
        ]);

        const content = h('div', [
            '...',
        ]);

        const accept = h('button', {
            staticClass: 'btn btn-xs btn-success',
            attrs: {
                type: 'button',
            },
            on: {
                click($event) {
                    $event.preventDefault();

                    vm.accept.call(null);
                },
            },
        }, [
            h('i', { staticClass: 'fa-solid fa-check pr-1' }),
            'Accept',
        ]);

        const decline = h('button', {
            staticClass: 'btn btn-xs btn-dark',
            attrs: {
                type: 'button',
            },
            on: {
                click($event) {
                    $event.preventDefault();

                    vm.decline.call(null);
                },
            },
        }, [
            h('i', { staticClass: 'fa-solid fa-times pr-1' }),
            'Decline',
        ]);

        return h('div', [
            content,
            h('hr'),
            info,
            h('hr'),
            h('div', {
                staticClass: 'd-flex flex-row',
            }, [
                h('div', [
                    accept,
                ]),
                h('div', { staticClass: 'ml-1' }, [
                    decline,
                ]),
            ]),
        ]);
    },
});
