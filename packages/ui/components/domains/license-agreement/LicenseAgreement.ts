/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CreateElement, VNode } from 'vue';
import Vue from 'vue';
import { LicenseAgreementCommand, useLicenseAgreementEventEmitter } from '../../../domains/license-agreement';
import LicenseAgreementForm from './LicenseAgreementForm';

export default Vue.extend({
    name: 'LicenseAgreement',
    created() {
        const eventEmitter = useLicenseAgreementEventEmitter();
        eventEmitter.on(LicenseAgreementCommand.ACCEPT, this.handleAcceptLicenseAgreementAction);
    },
    beforeDestroy() {
        const eventEmitter = useLicenseAgreementEventEmitter();
        eventEmitter.off(LicenseAgreementCommand.ACCEPT, this.handleAcceptLicenseAgreementAction);
    },
    methods: {
        handleAcceptLicenseAgreementAction() {
            if (this.$refs.modal) {
                this.$refs.modal.show();
            }
        },
        handleAccepted() {
            if (this.$refs.modal) {
                this.$refs.modal.hide();
            }

            // todo: reload current route
        },
        handleDeclined() {
            if (this.$refs.modal) {
                this.$refs.modal.hide();
            }

            // todo: redirect logout
        },
    },
    render(h: CreateElement): VNode {
        const vm = this;

        return h('b-modal', {
            ref: 'modal',
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
                on: {
                    accepted() {
                        vm.handleAccepted.call(null);
                    },
                    declined() {
                        vm.handleDeclined.call(null);
                    },
                },
            }),
        ]);
    },
});
