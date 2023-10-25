<!--
  Copyright (c) 2021-2023.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { BToaster } from 'bootstrap-vue-next';
import { defineComponent } from 'vue';
import { LicenseAgreement } from '../license-agreement';

export default defineComponent({
    components: { BToaster, LicenseAgreement },
    data() {
        return {
            startYear: 2020,
        };
    },
    computed: {
        year() {
            const year = new Date().getFullYear();

            return year === this.startYear ? year : `${this.startYear}-${year}`;
        },
    },
});
</script>
<template>
    <div>
        <div class="page-footer">
            <LicenseAgreement />

            <div class="copyright">
                &copy; {{ year }}
                <a href="https://pht-medic.github.io/documentation/about/team.html">PHT-meDIC</a>
            </div>
        </div>
        <BToaster />
    </div>
</template>
