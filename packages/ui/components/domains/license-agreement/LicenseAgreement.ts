/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BModal } from 'bootstrap-vue-next';
import { defineComponent } from 'vue';
import { LicenseAgreementCommand, useLicenseAgreementEventEmitter } from '../../../domains/license-agreement';
import LicenseAgreementForm from './LicenseAgreementForm';

export default defineComponent({
    name: 'LicenseAgreement',
    setup() {
        const modalRef = ref<null | Record<string, any>>(null);

        const handleAcceptLicenseAgreementAction = () => {
            if (modalRef.value) {
                modalRef.value.show();
            }
        };

        const handleAccepted = () => {
            if (modalRef.value) {
                modalRef.value.hide();
            }

            // todo: reload current route
        };

        const handleDeclined = () => {
            if (modalRef.value) {
                modalRef.value.hide();
            }

            // todo: redirect logout
        };

        onMounted(() => {
            const eventEmitter = useLicenseAgreementEventEmitter();
            eventEmitter.on(LicenseAgreementCommand.ACCEPT, handleAcceptLicenseAgreementAction);
        });

        onUnmounted(() => {
            const eventEmitter = useLicenseAgreementEventEmitter();
            eventEmitter.off(LicenseAgreementCommand.ACCEPT, handleAcceptLicenseAgreementAction);
        });

        return () => h(BModal, {
            ref: modalRef,
            props: {
                titleHtml: '<i class="fa-solid fa-file-contract"></i> License Agreement',
                size: 'lg',
                buttonSize: 'sm',
                noCloseOnBackdrop: true,
                noCloseOnEsc: true,
                hideFooter: true,
            },
        }, [
            h(LicenseAgreementForm, {
                onAccepted() {
                    handleAccepted();
                },
                onDeclined() {
                    handleDeclined();
                },
            }),
        ]);
    },
});
