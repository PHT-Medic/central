<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    Permission,
    PermissionID,
    ProposalStationApprovalStatus,
    TrainConfigurationStatus, editApiProposalStation,
} from '@personalhealthtrain/ui-common';
import { BDropdownItem } from 'bootstrap-vue';

export default {
    name: 'ProposalStationAction',
    props: {
        proposalStationId: Number,
        approvalStatus: String,
        action: String,
        actionType: {
            type: String,
            default: 'button',
        },
        withIcon: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            busy: false,
        };
    },
    computed: {
        actionText() {
            return this.action;
        },
        iconClass() {
            switch (this.action) {
                case 'approve':
                    return 'fa fa-check';
                case 'reject':
                    return 'fa fa-ban';
                default:
                    return 'fa fa-sync-alt';
            }
        },
        classSuffix() {
            switch (this.action) {
                case 'approve':
                    return 'success';
                case 'reject':
                    return 'danger';
                default:
                    return 'info';
            }
        },
        isShown() {
            return this.$auth.hasPermission(PermissionID.PROPOSAL_EDIT);
        },
        isEnabled() {
            if (typeof this.approvalStatus === 'undefined') {
                return true;
            }

            switch (this.approvalStatus) {
                case ProposalStationApprovalStatus.APPROVED:
                    if (this.action === 'approve') {
                        return false;
                    }
                    break;
                case ProposalStationApprovalStatus.REJECTED:
                    if (this.action === 'reject') {
                        return false;
                    }
                    break;
                default:
                    if (this.action === 'reset') {
                        return false;
                    }
                    break;
            }

            return true;
        },
    },
    methods: {
        click(ev) {
            ev.preventDefault();

            this.doAction();
        },
        async doAction() {
            if (this.itemBusy) return;

            this.itemBusy = true;

            let status;

            switch (this.action) {
                case 'approve':
                    status = ProposalStationApprovalStatus.APPROVED;
                    break;
                case 'reject':
                    status = ProposalStationApprovalStatus.REJECTED;
                    break;
                default:
                    status = null;
                    break;
            }

            try {
                const item = await editApiProposalStation(this.proposalStationId, {
                    approval_status: status,
                });

                this.$emit('done', item);
            } catch (e) {
                this.$emit('failed', e);
            }

            this.itemBusy = false;
        },
    },
    render(createElement, context) {
        if (!this.isShown) {
            return createElement('span', {}, ['']);
        }

        let rootElement;
        const attributes = {
            on: {
                click: this.click,
            },
            props: {
                disabled: !this.isEnabled,
            },
            domProps: {
                disabled: !this.isEnabled,
            },
        };

        const iconClasses = [this.iconClass, 'pr-1'];

        switch (this.actionType) {
            case 'dropDownItem':
                rootElement = BDropdownItem;
                iconClasses.push('pl-1', `text-${this.classSuffix}`);
                break;
            case 'link':
                rootElement = 'a';
                iconClasses.push(`text-${this.classSuffix}`);
                break;
            default:
                rootElement = 'button';
                attributes.type = 'button';
                attributes.class = ['btn', 'btn-xs', `btn-${this.classSuffix}`];
                break;
        }

        let text = [this.actionText];
        if (this.withIcon) {
            text.unshift(createElement('i', {
                class: iconClasses,
            }));
        }

        if (typeof this.$scopedSlots.default === 'function') {
            text = this.$scopedSlots.default({
                actionText: this.actionText,
                isDisabled: !this.isEnabled,
                isAllowed: this.isShown,
                iconClass: iconClasses,
            });
        }

        return createElement(rootElement, attributes, text);
    },
};
</script>
