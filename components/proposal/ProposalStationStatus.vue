<template>
    <span>
       <slot v-bind:badgeClass="badgeClass" v-bind:statusText="statusText">
            {{statusText}}
        </slot>
    </span>
</template>
<script>
export default {
    props: {
        status: {
            type: String,
            default: 'open'
        }
    },
    computed: {
        statusText() {
            switch (this.status) {
                case 'approved':
                    return 'angenommen';
                case 'rejected':
                    return 'abgelehnt';
                default:
                    return 'ausstehend';
            }
        },
        badgeClass() {
            switch (this.status) {
                case 'approved':
                    return 'badge-success';
                case 'rejected':
                    return 'badge-danger';
                default:
                    return 'badge-info';
            }
        }
    }
}
</script>
