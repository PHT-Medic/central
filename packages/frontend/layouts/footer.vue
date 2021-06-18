<script>
export default {
    data() {
        return {
            startYear: 2020
        }
    },
    computed: {
        year() {
            const year = new Date().getFullYear();

            return year === this.startYear ? year : this.startYear+'-'+year;
        }
    }
}
</script>
<template>
    <div class="page-footer">
        <div class="copyright">
            &copy; PHT {{ year }} &bull; UI- Design & -Code by <a href="https://tada5hi.net" target="_blank">Peter Placzek</a>
        </div>
    </div>
</template>
