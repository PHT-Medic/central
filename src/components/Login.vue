<script>
    import {mapGetters, mapActions} from "vuex";

    export default {
		props: ["redirectUrl"],
        data(){
            return {
                name : "",
                password : ""
            }
        },
        computed: {
            ...mapGetters('auth',[
                'loggedIn',
                'authenticationErrorCode',
                'authenticationErrorMessage'
            ])
        },
        methods : {
            ...mapActions('auth', [
                'login',
                'triggerAuthError'
            ]),

            handleSubmit(e){
                e.preventDefault();

                if(this.name !== '' && this.password !== '') {
                     this.login({name: this.name, password: this.password});
                } else {
					this.triggerAuthError('Es muss ein Benutzername und ein Passwort angegeben werden.');
                }
            }
        }
    }
</script>
<template>
    <div class="text-left">
        <h4 class="title">Login</h4>
        <div v-if="authenticationErrorMessage !== ''" class="alert alert-danger alert-sm" v-html="authenticationErrorMessage"></div>

        <form>
            <div class="form-group">
                <label for="name">Name</label>
                <input class="form-control" id="name" type="text" v-model="name" placeholder="Benutzername oder E-mail" required autofocus>
            </div>
            <div class="form-group">
                <label for="password" >Passwort</label>
                <input class="form-control" id="password" type="password" v-model="password" placeholder="Passwort" required>
            </div>
            <div>
                <button type="submit" @click="handleSubmit" class="btn btn-outline-primary btn-sm">
                    Login
                </button>
            </div>
        </form>
    </div>
</template>
