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
    <div class="text-left">
        <div class="hero-image m-b-20">
            <div class="hero-text">
                <h1 class="title no-border text-light">
                    PHT <span class="sub-title">Personal Health Train</span>
                </h1>
            </div>
        </div>
        <h4 class="title">
            Dashboard
        </h4>
        <div class="panel-card">
            <div class="panel-card-body">
                <div class="alert alert-sm alert-info">
                    <h5>Herzlich Willkommen,</h5>
                    auf dem Dashboard des Central User-Interfaces.<br />
                    Hier können <b>Anträge</b> erstellt & verwaltet werden. Zudem können aus diesen Anträge sogenannte <b>Discovery- </b> & <b>Analyse-Züge</b> erstellt werden.
                </div>
            </div>
        </div>
    </div>
</template>
