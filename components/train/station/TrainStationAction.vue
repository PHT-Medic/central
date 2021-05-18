<script>
import {BDropdownItem} from "bootstrap-vue";
import {editTrainStation} from "@/domains/train-station/api";
import {TrainStationStatusOptions} from "@/domains/train-station";

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
        click(ev) {
            ev.preventDefault();

            this.doAction();
        },
        async doAction() {
            if(this.itemBusy) return;

            this.itemBusy = true;

            let status;

            switch (this.action) {
                case 'approve':
                    status = TrainStationStatusOptions.TrainStationStatusApproved;
                    break;
                case 'reject':
                    status = TrainStationStatusOptions.TrainStationStatusRejected;
                    break;
                default:
                    status = TrainStationStatusOptions.TrainStationStatusOpen;
                    break;
            }

            try {
                const item = await editTrainStation(this.trainStationId, {
                    status
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
                case TrainStationStatusOptions.TrainStationStatusApproved:
                    if(this.action === 'approve') {
                        return true;
                    }
                    break;
                case TrainStationStatusOptions.TrainStationStatusRejected:
                    if(this.action === 'reject') {
                        return true;
                    }
                    break;
                case TrainStationStatusOptions.TrainStationStatusOpen:
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
