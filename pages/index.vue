<script>
    import { mapGetters } from 'vuex'
    import MedicineLab from "@/components/svg/MedicineLab";
    import WorldSvg from "@/components/svg/WorldSvg";

    export default {
        components: {WorldSvg, MedicineLab},
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
        <h1 class="title no-border mb-5 text-center">
            PHT <span class="sub-title">{{ user.realm.name }} Realm</span>
        </h1>

        <div class="row">
            <div class="col-lg-6 col-12">
                <h5 class="text-center">Discover the PHT today!</h5>
                <world-svg width="100%" />
                <div class="text-center">
                    <p>The DIFUTURE implementation of the <strong>Personal Health Train (PHT)</strong> from Tübingen University as part of the PHT implementation network.</p>
                </div>
            </div>
            <div class="col-lg-6 col-12">
                <h6>Architecture</h6>

                <div>
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
                <div class="text-center">
                    <img src="https://pht.medic.uni-tuebingen.de/wp-content/uploads/2021/01/Services-11.png" class="img-fluid w-75"/>
                </div>
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
    </div>
</template>
