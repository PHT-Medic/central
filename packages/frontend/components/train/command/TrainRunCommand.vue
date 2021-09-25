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
            type: TrainCommand,
            default: TrainCommand.START
        },


        elementType: {
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
                iconClasses.push('text-'+this.classSuffix);
                break;
            default:
                rootElement = 'button';
                attributes.type = 'button';
                attributes.class = ['btn', 'btn-xs', 'btn-'+this.classSuffix];
                break;
        }

        let text = [this.commandText];
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
            if(this.train.configurationStatus !== TrainConfigurationStatus.FINISHED ||
                this.train.buildStatus !== TrainBuildStatus.FINISHED ||
                !this.$auth.can('edit','train')
            ) {
                return false;
            }

            return true;
        },
        isEnabled() {
            switch (this.command) {
                case TrainCommand.START:
                    return !this.train.runStatus || [TrainRunStatus.STOPPED, TrainRunStatus.STOPPING, TrainRunStatus.FAILED].indexOf(this.train.runStatus) !== -1
                case TrainCommand.STOP:
                    return this.train.runStatus && [TrainRunStatus.STOPPED, TrainRunStatus.FINISHED].indexOf(this.train.runStatus) === -1
            }

            return false;
        },
        commandText() {
            switch (this.command) {
                case TrainCommand.START:
                    return 'start';
                case TrainCommand.STOP:
                    return 'stop';
                default:
                    return '';
            }
        },
        iconClass() {
            switch (this.command) {
                case TrainCommand.START:
                    return 'fa fa-play';
                case TrainCommand.STOP:
                    return 'fa fa-stop';
                default:
                    return '';
            }
        },
        classSuffix() {
            switch (this.command) {
                case TrainCommand.START:
                    return 'success';
                case TrainCommand.STOP:
                    return 'danger';
                default:
                    return 'info';
            }
        },
    }
}
</script>
