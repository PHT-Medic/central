<script>
    import { mapGetters } from 'vuex'

    export default {
        meta: {
            requireLoggedIn: true
        },
        data: () => {
            return {
                age: 'Hi'
            }
        },
        computed: {
            ...mapGetters('auth', [
                'loggedIn',
                'user'
            ]),

            test () {
                return 'Hi'
            }
        }
    }
</script>
<template>
    <div class="">
        <div class="hero-image m-b-20">
            <div class="hero-text">
                <h1 class="title no-border text-light mb-1">
                    PHT <span class="sub-title">{{ user.realm.name }}</span>
                </h1>
                <p>
                    <template v-if="user.realm.description">
                        {{user.realm.description}}
                    </template>
                    <template v-else>
                        keine Beschreibung vorhanden...
                    </template>
                </p>
            </div>
        </div>
        <h4 class="title">
            Dashboard
        </h4>
    </div>
</template>
