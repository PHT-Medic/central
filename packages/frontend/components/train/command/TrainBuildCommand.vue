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
            default: TrainCommand.BUILD_START
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
            busy: false
        }
    },
    render(createElement) {
        let rootElement;
        let attributes = {
            on: {
                click: this.click
            },
            props: {
                disabled: !this.isAvailable
            },
            domProps: {
                disabled: !this.isAvailable
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
            this.$scopedSlots.default({
                commandText: this.commandText,
                isDisabled: !this.isAvailable,
                isAllowed: this.isAllowed,
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
            if(this.busy || !this.isAllowed) return;

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
        isAvailable() {
            if(
                this.train.configurationStatus !== TrainConfigurationStatus.FINISHED ||
                !this.isAllowed
            ) {
                return false;
            }

            switch (this.command) {
                case TrainCommand.BUILD_START:
                    return !this.train.buildStatus ||
                        [
                            TrainBuildStatus.STOPPED,
                            TrainBuildStatus.FAILED
                        ].indexOf(this.train.buildStatus) !== -1;
                case TrainCommand.BUILD_STOP:
                    return this.train.buildStatus &&
                        [
                            TrainBuildStatus.STARTING,
                            TrainBuildStatus.STARTED,
                            TrainBuildStatus.FINISHED,
                            TrainBuildStatus.STOPPING
                        ].indexOf(this.train.buildStatus) !== -1
            }
            return false;
        },
        isAllowed() {
            return this.$auth.can('edit','train');
        },
        commandText() {
            switch (this.command) {
                case TrainCommand.BUILD_START:
                    return 'start';
                case TrainCommand.BUILD_STOP:
                    return 'stop';
                default:
                    return '';
            }
        },
        iconClass() {
            switch (this.command) {
                case TrainCommand.BUILD_START:
                    return 'fa fa-wrench';
                case TrainCommand.BUILD_STOP:
                    return 'fa fa-stop';
                default:
                    return '';
            }
        },
        classSuffix() {
            switch (this.command) {
                case TrainCommand.BUILD_START:
                    return 'success';
                case TrainCommand.BUILD_STOP:
                    return 'danger';
                default:
                    return 'info';
            }
        },
    }
}
</script>
