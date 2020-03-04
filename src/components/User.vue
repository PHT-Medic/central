<script>
	import {mapGetters} from "vuex";

	export default {
		data(){
			return {
				name : "",
				password : ""
			}
		},
		beforeRouteUpdate (to, from, next) {
			this.test(to.params.id);

			next()
		},
        beforeRouteEnter (to, from, next) {
			console.log(123);
			next();
        },
		computed: {
			...mapGetters('auth',[
				'loggedIn'
			])
		},
		methods : {
			test: (data) => {
				console.log(data);
            }
		}
	}
</script>
<template>
    <div class="text-left">
        <h4 class="title">User {{$route.params.id}}</h4>
        <button type="button" v-on:click="test($attrs)" class="btn btn-outline-primary btn-sm">
            Login
        </button>
    </div>
</template>
