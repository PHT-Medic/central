/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BModal } from 'bootstrap-vue-next';
import {
    defineComponent, h, onMounted, onUnmounted, ref,
} from 'vue';
import { LicenseAgreementEvent, useLicenseAgreementEventEmitter } from '../../domains/license-agreement';
import LicenseAgreementForm from './LicenseAgreementForm';

export default defineComponent({
    setup() {
        const modalShow = ref<boolean>(false);
        const eventEmitter = useLicenseAgreementEventEmitter();

        const handleAcceptLicenseAgreementAction = () => {
            modalShow.value = true;
        };

        const handleAccepted = () => {
            modalShow.value = false;

            eventEmitter.emit(LicenseAgreementEvent.ACCEPTED);
        };

        const handleDeclined = () => {
            modalShow.value = false;

            eventEmitter.emit(LicenseAgreementEvent.DECLINED);
        };

        onMounted(() => {
            eventEmitter.on(LicenseAgreementEvent.ACCEPT, handleAcceptLicenseAgreementAction);
        });

        onUnmounted(() => {
            eventEmitter.off(LicenseAgreementEvent.ACCEPT, handleAcceptLicenseAgreementAction);
        });

        return () => h(BModal, {
            modelValue: modalShow.value,
            size: 'lg',
            buttonSize: 'sm',
            noCloseOnBackdrop: true,
            noCloseOnEsc: true,
            hideFooter: true,
            onClose() {
                handleDeclined();
            },
        }, {
            default: () => h(LicenseAgreementForm, {
                onAccepted() {
                    handleAccepted();
                },
                onDeclined() {
                    handleDeclined();
                },
            }),
            title: () => [
                h('i', { class: 'fa-solid fa-file-contract' }),
                ' ',
                'License Agreement',
            ],
        });
    },
});
