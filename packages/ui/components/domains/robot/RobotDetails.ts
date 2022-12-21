/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    maxLength, minLength,
} from 'vuelidate/lib/validators';
import { Robot } from '@authup/common';
import { buildFormInput, buildFormSubmit, initPropertiesFromSource } from '@vue-layout/utils';
import Vue, { CreateElement, PropType, VNode } from 'vue';
import { buildVuelidateTranslator } from '../../../config/ilingo/utils';

export default Vue.extend<any, any, any, any>({
    name: 'RobotDetails',
    props: {
        where: Object as PropType<Partial<Robot>>,
    },
    data() {
        return {
            busy: false,
            entity: null,
            form: {
                id: '',
                secret: '',
            },
        };
    },
    computed: {
        isEditing() {
            return true;
        },
    },
    created() {
        Promise.resolve()
            .then(this.resolve);
    },
    validations: {
        form: {
            id: {

            },
            secret: {
                minLength: minLength(3),
                maxLength: maxLength(256),
            },
        },
    },
    methods: {
        async resolve() {
            if (this.busy) return;

            this.busy = true;

            try {
                const { data } = await this.$authApi.robot.getMany({
                    filter: this.where,
                    page: {
                        limit: 1,
                    },
                });

                if (data.length === 1) {
                    // eslint-disable-next-line prefer-destructuring
                    this.entity = data[0];

                    initPropertiesFromSource(this.entity, this.form);

                    this.$emit('resolved', this.entity);
                }
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },

        handleUpdated(item: Robot) {
            const keys = Object.keys(item) as (keyof Robot)[];
            for (let i = 0; i < keys.length; i++) {
                Vue.set(this.entity, keys[i], item[keys[i]]);
            }

            Promise.resolve()
                .then(this.resolve)
                .then(() => this.$emit('updated', this.entity));
        },

        async submit() {
            if (this.busy || !this.isEditing) return;

            this.busy = true;

            try {
                const entity = await this.$authApi.robot.update(this.entity.id, {
                    ...this.form,
                });

                this.handleUpdated(entity);
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },
    },
    render(h: CreateElement): VNode {
        const vm = this;

        if (!vm.entity) {
            return h(
                'div',
                { staticClass: 'alert alert-sm alert-warning' },
                [
                    'The robot details can not be displayed.',
                ],
            );
        }

        const id = buildFormInput<Robot>(vm, h, {
            validationTranslator: buildVuelidateTranslator(vm.$ilingo),
            title: 'ID',
            propName: 'id',
            attrs: {
                disabled: true,
            },
        });

        const secret = buildFormInput<Robot>(vm, h, {
            validationTranslator: buildVuelidateTranslator(vm.$ilingo),
            title: 'Secret',
            propName: 'secret',
        });

        const submit = buildFormSubmit(vm, h, {
            updateText: 'Update',
            createText: 'Create',
        });

        return h('div', [
            id,
            secret,
            submit,
        ]);
    },
});
