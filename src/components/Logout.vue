<script>
	import {mapActions} from "vuex";

	export default {
		created() {
			this.doLogout();
		},
		methods : {
			...mapActions('auth', [
				'logout',
				'triggerAuthError'
			]),

            doLogout() { this.logout(); },
		}
	}
</script>
<template>
    <div></div>
</template>