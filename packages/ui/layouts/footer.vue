<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import LicenseAgreement from '../components/domains/license-agreement/LicenseAgreement';

export default {
    components: { LicenseAgreement },
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
};
</script>
<template>
    <div class="page-footer">
        <license-agreement />

        <div class="copyright">
            &copy; {{ year }}
            <a href="https://pht-medic.github.io/documentation/about/team.html">PHT-meDIC</a>
        </div>
    </div>
</template>
