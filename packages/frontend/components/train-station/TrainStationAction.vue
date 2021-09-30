<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {editAPITrainStation, TrainStationApprovalStatus} from "@personalhealthtrain/ui-common";
import {BDropdownItem} from "bootstrap-vue";

export default {
    name: 'TrainStationAction',
    render(createElement) {
        let rootElement;
        let attributes = {
            on: {
                click: this.click
            },
            props: {
                disabled: this.isDisabled
            }
        };

        let iconClasses = [this.iconClass, 'pr-1'];

        switch (this.actionType) {
            case 'dropDownItem':
                rootElement = BDropdownItem;
                iconClasses.push('pl-1', 'text-'+this.classSuffix);
                break;
            case 'link':
                rootElement = 'a';
                iconClasses.push('text-'+this.classSuffix);
                break;
            default:
                rootElement = 'button';
                attributes.type = 'button';
                attributes.class = ['btn', 'btn-xs', 'btn-'+this.classSuffix];
                break;
        }

        let text = [this.actionText];
        if(this.withIcon) {
            text.unshift(createElement('i', {
                class: iconClasses
            }))
        }

        if(typeof this.$scopedSlots.default === 'function') {
            text = this.$scopedSlots.default({
                actionText: this.actionText,
                isDisabled: this.isDisabled,
                iconClass: iconClasses
            });
        }

        return createElement(rootElement, attributes, text);
    },
    props: {
        trainStationId: String | Number,
        status: String,
        action: String,
        actionType: {
            type: String,
            default: 'button'
        },
        withIcon: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            busy: false
        }
    },
    methods: {
        async click(ev) {
            ev.preventDefault();

            await this.doAction();
        },
        async doAction() {
            if(this.itemBusy) return;

            this.itemBusy = true;

            let status;

            switch (this.action) {
                case 'approve':
                    status = TrainStationApprovalStatus.APPROVED;
                    break;
                case 'reject':
                    status = TrainStationApprovalStatus.REJECTED;
                    break;
                default:
                    status = null;
                    break;
            }

            try {
                const item = await editAPITrainStation(this.trainStationId, {
                    approval_status: status
                });

                this.$emit('done',item);
            } catch (e) {
                this.$emit('failed', e);
            }

            this.itemBusy = false;
        }
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
        isDisabled() {
            if(typeof this.status === 'undefined') {
                return false;
            }

            switch (this.status) {
                case TrainStationApprovalStatus.APPROVED:
                    if(this.action === 'approve') {
                        return true;
                    }
                    break;
                case TrainStationApprovalStatus.REJECTED:
                    if(this.action === 'reject') {
                        return true;
                    }
                    break;
                default:
                    if(this.action === 'reset') {
                        return true;
                    }
                    break;
            }

            return false;
        }
    }
}
</script>
