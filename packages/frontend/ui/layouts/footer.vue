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
            &copy; PHT {{ year }} &bull; UI - Design & Code by <a
                href="https://tada5hi.net"
                target="_blank"
            >Peter Placzek</a>
        </div>
    </div>
</template>
