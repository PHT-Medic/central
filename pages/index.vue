<script>
    import { mapGetters } from 'vuex'
    import MedicineLab from "@/components/svg/MedicineLab";

    export default {
        components: {MedicineLab},
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
    <div class="container">
        <h1 class="title no-border mb-1">
            PHT <span class="sub-title">{{ user.realm.name }} Realm</span>
        </h1>
        <p>The DIFUTURE implementation of the <strong>Personal Health Train (PHT)</strong> from Tübingen University as part of the PHT implementation network.</p>

        <h5 class="text-center">Discover the PHT today!</h5>
        <medicine-lab width="100%" />

        <hr />

        <h6>Architecture</h6>

        <div class="row">
            <div class="col">
                The Tübingen implementation of the PHT has several central services which are used to submit, control and execute trains.
                Our current implementation relies on the manual acceptance of each train before it can be executed at a hospital.
                Details regarding our implementation are described below.<br />
                <br />
                &bull; A manual review step of each executed train<br />
                &bull;  Use container technologies to adapt rapidly on the analytical requirements<br />
                &bull; A central architecture to submit and distribute trains to each station<br />
                <br />
                Code available at: <a href="https://gitlab.com/PersonalHealthTrain/implementations/germanmii/difuture" target="_blank">gitlab.com</a>
            </div>
            <div class="col">
                <img src="https://pht.medic.uni-tuebingen.de/wp-content/uploads/2021/01/Services-11.png" class="img-fluid"/>
            </div>
        </div>


        <div class="row">
            <!--
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
            -->
        </div>

        <hr />


    </div>
</template>
