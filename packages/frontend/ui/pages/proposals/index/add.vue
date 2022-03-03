<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    PermissionID,
} from '@personalhealthtrain/central-common';
import {
    alpha, integer, maxLength, minLength, required,
} from 'vuelidate/lib/validators';

import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { ProposalForm } from '../../../components/domains/proposal/ProposalForm';

export default {
    components: {
        ProposalForm,
    },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.PROPOSAL_ADD,
        ],
    },
    data() {
        return {
            formData: {
                title: '',
                requested_data: '',
                station_ids: [],
                master_image_id: '',
                risk: '',
                risk_comment: '',
            },

            busy: false,
            errorMessage: '',

            station: {
                items: [],
                busy: false,
            },

            risks: [
                { id: 'low', name: '(Low) Low risk', class: 'btn-success' },
                { id: 'mid', name: '(Mid) Mid risk', class: 'btn-warning' },
                { id: 'high', name: '(High) High risk', class: 'btn-danger' },
            ],
        };
    },
    validations: {
        formData: {
            title: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(100),
            },
            requested_data: {
                required,
                minLength: minLength(10),
                maxLength: maxLength(2048),
            },
            station_ids: {
                required,
                minLength: minLength(1),
                $each: {
                    required,
                    integer,
                },
            },
            master_image_id: {
                required,
            },
            risk: {
                required,
                alpha,
            },
            risk_comment: {
                required,
                minLength: minLength(10),
                maxLength: maxLength(2048),
            },
        },
    },
    methods: {
        async handleCreated(entity) {
            this.$bvToast.toast('The proposal was successfully created.', {
                variant: 'success',
                toaster: 'b-toaster-top-center',
            });

            await this.$nuxt.$router.push(`/proposals/${entity.id}`);
        },
    },
};
</script>
<template>
    <proposal-form @created="handleCreated" />
</template>
