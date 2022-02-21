<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { TrainResultStatus, TrainRunStatus } from '@personalhealthtrain/central-common';
import { BDropdownItem } from 'bootstrap-vue';
import { FrontendTrainCommand } from '../../../../domains/train/constants';

export default {
    props: {
        train: {
            type: Object,
            default: undefined,
        },
        trainResultId: {
            type: String,
            default: null,
        },
        command: {
            type: String,
            default: FrontendTrainCommand.RESULT_START,
        },

        elementType: {
            type: String,
            default: 'button',
        },
        withIcon: {
            type: Boolean,
            default: false,
        },
        withText: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            busy: false,
        };
    },
    computed: {
        isShown() {
            return this.$auth.can('edit', 'train') &&
                (this.train.run_status === TrainRunStatus.FINISHED || this.command === FrontendTrainCommand.RESULT_STATUS);
        },
        isEnabled() {
            if (
                !this.isShown
            ) {
                return false;
            }

            switch (this.command) {
                case FrontendTrainCommand.RESULT_START:
                    return !this.train.result_last_status ||
                        [
                            TrainResultStatus.STOPPED,
                            TrainResultStatus.FAILED,
                        ].indexOf(this.train.result_last_status) !== -1;
                case FrontendTrainCommand.RESULT_STOP:
                    return this.train.result_last_status &&
                        [
                            TrainResultStatus.STARTING,
                            TrainResultStatus.STARTED,
                            TrainResultStatus.FINISHED,
                            TrainResultStatus.STOPPING,
                        ].indexOf(this.train.result_last_status) !== -1;
                case FrontendTrainCommand.RESULT_STATUS:
                case FrontendTrainCommand.RESULT_DOWNLOAD:
                    return true;
            }

            return false;
        },
        commandText() {
            switch (this.command) {
                case FrontendTrainCommand.RESULT_DOWNLOAD:
                    return 'download';
                case FrontendTrainCommand.RESULT_START:
                    return 'start';
                case FrontendTrainCommand.RESULT_STOP:
                    return 'stop';
                case FrontendTrainCommand.RESULT_STATUS:
                    return 'check';
                default:
                    return '';
            }
        },
        iconClass() {
            switch (this.command) {
                case FrontendTrainCommand.RESULT_DOWNLOAD:
                    return 'fa fa-download';
                case FrontendTrainCommand.RESULT_START:
                    return 'fa fa-wrench';
                case FrontendTrainCommand.RESULT_STOP:
                    return 'fa fa-stop';
                case FrontendTrainCommand.RESULT_STATUS:
                    return 'fas fa-shield-alt';
                default:
                    return '';
            }
        },
        classSuffix() {
            switch (this.command) {
                case FrontendTrainCommand.RESULT_DOWNLOAD:
                    return 'dark';
                case FrontendTrainCommand.RESULT_START:
                    return 'success';
                case FrontendTrainCommand.RESULT_STOP:
                    return 'danger';
                case FrontendTrainCommand.RESULT_STATUS:
                    return 'primary';
                default:
                    return 'info';
            }
        },
    },
    methods: {
        async click(ev) {
            ev.preventDefault();

            await this.do();
        },
        async do() {
            if (this.busy || !this.isShown) return;

            this.busy = true;

            const resultId = this.trainResultId ?? this.train.result_last_id;

            try {
                switch (this.command) {
                    case FrontendTrainCommand.RESULT_DOWNLOAD:
                        window.open(`${this.$config.resultServiceApiUrl}train-results/${resultId}/download`);
                        break;
                    default:
                        const train = await this.$api.train.runCommand(this.train.id, this.command);
                        this.$emit('done', train);
                        break;
                }

                const message = `Successfully executed result command ${this.commandText}`;
                this.$bvToast.toast(message, { toaster: 'b-toaster-top-center', variant: 'success' });
            } catch (e) {
                this.$bvToast.toast(e.message, { toaster: 'b-toaster-top-center', variant: 'danger' });

                this.$emit('failed', e);
            }

            this.busy = false;
        },
    },
    render(createElement) {
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

        switch (this.elementType) {
            case 'dropDownItem':
                rootElement = BDropdownItem;
                iconClasses.push('pl-1', `text-${this.classSuffix}`);
                break;
            case 'link':
                rootElement = 'a';
                // eslint-disable-next-line no-script-url
                attributes.domProps.href = 'javascript:void(0)';
                iconClasses.push(`text-${this.classSuffix}`);
                break;
            default:
                rootElement = 'button';
                attributes.type = 'button';
                attributes.class = ['btn', 'btn-xs', `btn-${this.classSuffix}`];
                break;
        }

        let text = [this.commandText];

        if (!this.withText) {
            text = [];
        }

        if (this.withIcon) {
            text.unshift(createElement('i', {
                class: iconClasses,
            }));
        }

        if (typeof this.$scopedSlots.default === 'function') {
            this.$scopedSlots.default({
                commandText: this.commandText,
                isDisabled: !this.isEnabled,
                isAllowed: this.isShown,
                iconClass: iconClasses,
            });
        }

        return createElement(rootElement, attributes, text);
    },
};
</script>
