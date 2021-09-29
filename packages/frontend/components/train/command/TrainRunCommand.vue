<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {TrainConfigurationStatus, TrainBuildStatus, TrainRunStatus} from "@/domains/train/index.ts";
import {runTrainCommand} from "@/domains/train/api.ts";
import {TrainCommand} from "@/domains/train/type";
import {BDropdownItem} from "bootstrap-vue";

export default {
    props: {
        train: {
            type: Object,
            default: undefined
        },
        command: {
            type: String,
            default: TrainCommand.RUN_START
        },

        elementType: {
            type: String,
            default: 'button'
        },
        withIcon: {
            type: Boolean,
            default: false
        },
        withText: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            busy: false,
            trainCommand: TrainCommand
        }
    },
    render(createElement) {
        if(!this.isShown) {
            return createElement('span', {}, ['']);
        }

        let rootElement;
        let attributes = {
            on: {
                click: this.click
            },
            props: {
                disabled: this.isEnabled
            },
            domProps: {
                disabled: this.isEnabled
            }
        };

        let iconClasses = [this.iconClass, 'pr-1'];

        switch (this.elementType) {
            case 'dropDownItem':
                rootElement = BDropdownItem;
                iconClasses.push('pl-1', 'text-'+this.classSuffix);
                break;
            case 'link':
                rootElement = 'a';
                attributes.domProps.href= 'javascript:void(0)';
                iconClasses.push('text-'+this.classSuffix);
                break;
            default:
                rootElement = 'button';
                attributes.type = 'button';
                attributes.class = ['btn', 'btn-xs', 'btn-'+this.classSuffix];
                break;
        }

        let text = [this.commandText];

        if(!this.withText) {
            text = [];
        }

        if(this.withIcon) {
            text.unshift(createElement('i', {
                class: iconClasses
            }))
        }

        if(typeof this.$scopedSlots.default === 'function') {
            text = this.$scopedSlots.default({
                commandText: this.commandText,
                isEnabled: this.isEnabled,
                isShown: this.isShown,
                iconClass: iconClasses
            });
        }

        return createElement(rootElement, attributes, text);
    },
    methods: {
        async click(ev) {
            ev.preventDefault();

            await this.do();
        },
        async do() {
            if(this.busy || !this.isEnabled) return;

            this.busy = true;

            try {
                const train = await runTrainCommand(this.train.id, this.command);

                const message =  `Successfully executed run command ${this.commandText}.`;
                this.$bvToast.toast(message, {toaster: 'b-toaster-top-center', variant: 'success'});

                this.$emit('done', train);
            } catch (e) {
                this.$bvToast.toast(e.message, {toaster: 'b-toaster-top-center', variant: 'danger'});

                this.$emit('failed', e);
            }

            this.busy = false;
        }
    },
    computed: {
        isShown() {
            return (
                    (
                        this.train.configurationStatus === TrainConfigurationStatus.FINISHED &&
                        this.train.buildStatus === TrainBuildStatus.FINISHED
                    ) ||
                        this.command === TrainCommand.RUN_STATUS
                ) &&
                this.$auth.can('edit', 'train');
        },
        isEnabled() {
            switch (this.command) {
                case TrainCommand.RUN_START:
                    return !this.train.runStatus || [TrainRunStatus.STOPPED, TrainRunStatus.STOPPING, TrainRunStatus.FAILED].indexOf(this.train.runStatus) !== -1
                case TrainCommand.RUN_STOP:
                    return this.train.runStatus && [TrainRunStatus.STOPPED, TrainRunStatus.FINISHED].indexOf(this.train.runStatus) === -1
                case TrainCommand.RUN_STATUS:
                    return true;
            }

            return false;
        },
        commandText() {
            switch (this.command) {
                case TrainCommand.RUN_START:
                    return 'start';
                case TrainCommand.RUN_STOP:
                    return 'stop';
                case TrainCommand.RUN_STATUS:
                    return 'status';
                default:
                    return '';
            }
        },
        iconClass() {
            switch (this.command) {
                case TrainCommand.RUN_START:
                    return 'fa fa-play';
                case TrainCommand.RUN_STOP:
                    return 'fa fa-stop';
                case TrainCommand.RUN_STATUS:
                    return 'fas fa-search';
                default:
                    return '';
            }
        },
        classSuffix() {
            switch (this.command) {
                case TrainCommand.RUN_START:
                    return 'success';
                case TrainCommand.RUN_STOP:
                    return 'danger';
                case TrainCommand.RUN_STATUS:
                    return 'primary';
                default:
                    return 'info';
            }
        },
    }
}
</script>
