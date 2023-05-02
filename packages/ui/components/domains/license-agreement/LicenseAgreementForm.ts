/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineComponent } from 'vue';
import LicenseAgreementContent from './LicenseAgreementContent.vue';

export default defineComponent({
    name: 'LicenseAgreementForm',
    emits: ['accepted', 'failed', 'declined'],
    setup(props, { emit }) {
        const busy = ref(false);

        const accept = async () => {
            if (busy.value) {
                return;
            }

            busy.value = true;

            try {
                const userAttribute = await useAuthupAPI()
                    .userAttribute.create({
                        name: 'license_agreement',
                        value: 'accepted',
                    });

                emit('accepted', userAttribute);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }

            busy.value = false;
        };

        const decline = () => {
            emit('declined');
        };

        return () => {
            const info = h('div', {
                class: 'alert alert-sm alert-warning',
            }, [
                h('i', { class: 'fa fa-exclamation-triangle pr-1' }),
                'It is necessary to accept the license agreement',
                ' in order to be able to use the application in its entirety.',
            ]);

            const content = h('div', [
                h(LicenseAgreementContent),
            ]);

            return h('div', [
                info,
                h('hr'),
                content,
                h('hr'),
                h('div', {
                    class: 'd-flex flex-row',
                }, [
                    h('div', [
                        h('button', {
                            class: 'btn btn-xs btn-success',
                            type: 'button',
                            onClick($event: any) {
                                $event.preventDefault();

                                return accept();
                            },
                        }, [
                            h('i', { class: 'fa-solid fa-check pr-1' }),
                            'Accept',
                        ]),
                    ]),
                    h('div', { class: 'ml-1' }, [
                        h('button', {
                            class: 'btn btn-xs btn-dark',
                            type: 'button',
                            onClick($event: any) {
                                $event.preventDefault();

                                decline();
                            },
                        }, [
                            h('i', { class: 'fa-solid fa-times pr-1' }),
                            'Decline',
                        ]),
                    ]),
                ]),
            ]);
        };
    },
});
