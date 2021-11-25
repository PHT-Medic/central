<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { addAPIRealm, editAPIRealm } from '@personalhealthtrain/ui-common';
import { maxLength, minLength, required } from 'vuelidate/lib/validators';

import AlertMessage from '../../alert/AlertMessage';
import NotImplemented from '../../NotImplemented';

export default {
    components: {
        AlertMessage,
        NotImplemented,
    },
    props: {
        itemProperty: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            formData: {
                id: '',
                name: '',
            },

            busy: false,
            message: null,
        };
    },
    validations: {
        formData: {
            id: {
                minLength: minLength(5),
                maxLength: maxLength(36),
            },
            name: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(100),
            },
        },
    },
    computed: {
        isEditing() {
            return this.itemProperty && this.itemProperty.hasOwnProperty('id');
        },
    },
    created() {
        if (typeof this.itemProperty !== 'undefined') {
            this.formData.id = this.itemProperty.id ?? '';
            this.formData.name = this.itemProperty.name ?? '';
        }
    },
    methods: {
        async handleSubmit() {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.message = null;
            this.busy = true;

            try {
                let response;
                const formData = {
                    name: this.formData.name,
                    id: this.formData.id,
                };

                if (this.isEditing) {
                    response = await editAPIRealm(this.itemProperty.id, { name: formData.name });

                    this.message = {
                        isError: false,
                        data: 'The realm was successfully updated.',
                    };

                    this.$emit('updated', response);
                } else {
                    response = await addAPIRealm(formData);

                    this.message = {
                        isError: false,
                        data: 'The realm was successfully created.',
                    };

                    this.$emit('created', response);
                }
            } catch (e) {
                this.message = {
                    data: e.message,
                    isError: true,
                };
            }

            this.busy = false;
        },
    },
};
</script>
<template>
    <div>
        <alert-message :message="message" />

        <div class="form-group">
            <div
                class="form-group"
                :class="{ 'form-group-error': $v.formData.id.$error }"
            >
                <label>ID</label>
                <input
                    v-model="$v.formData.id.$model"
                    type="text"
                    name="id"
                    class="form-control"
                    :disabled="isEditing"
                    placeholder="..."
                >

                <div
                    v-if="!$v.formData.id.required && !$v.formData.id.$model"
                    class="form-group-hint group-required"
                >
                    Enter an Identifier.
                </div>
                <div
                    v-if="!$v.formData.id.minLength"
                    class="form-group-hint group-required"
                >
                    The length of the ID must be greater than <strong>{{ $v.formData.id.$params.minLength.min }}</strong> characters.
                </div>
                <div
                    v-if="!$v.formData.id.maxLength"
                    class="form-group-hint group-required"
                >
                    The length of the ID must be less than <strong>{{ $v.formData.id.$params.maxLength.max }}</strong> characters.
                </div>
            </div>

            <hr>

            <div
                class="form-group"
                :class="{ 'form-group-error': $v.formData.name.$error }"
            >
                <label>Name</label>
                <input
                    v-model="$v.formData.name.$model"
                    type="text"
                    name="name"
                    class="form-control"
                    placeholder="..."
                >

                <div
                    v-if="!$v.formData.name.required && !$v.formData.name.$model"
                    class="form-group-hint group-required"
                >
                    Enter a Name.
                </div>
                <div
                    v-if="!$v.formData.name.minLength"
                    class="form-group-hint group-required"
                >
                    The length of the ID must be greater than <strong>{{ $v.formData.name.$params.minLength.min }}</strong> characters.
                </div>
                <div
                    v-if="!$v.formData.name.maxLength"
                    class="form-group-hint group-required"
                >
                    The length of the ID must be less than <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> characters.
                </div>
            </div>

            <hr>

            <div class="form-group">
                <button
                    type="submit"
                    class="btn btn-outline-primary btn-sm"
                    :disabled="$v.$invalid || busy"
                    @click.prevent="handleSubmit"
                >
                    {{ isEditing ? 'Update' : 'Create' }}
                </button>
            </div>
        </div>
    </div>
</template>
