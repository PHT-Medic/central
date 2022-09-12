<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import Vue, { CreateElement, VNode } from 'vue';
import { maxLength, minLength, required } from 'vuelidate/lib/validators';
import { IdentityProvider } from '@authelion/common';
import { BuildInput } from 'rapiq';
import { SlotName, buildFormInput, buildFormSubmit } from '@vue-layout/utils';
import { IdentityProviderList } from '@authelion/vue';
import MedicineWorker from '../components/svg/MedicineWorker';
import { LayoutKey, LayoutNavigationID } from '../config/layout';
import { buildVuelidateTranslator } from '../config/ilingo/utils';

export default Vue.extend({
    components: { MedicineWorker },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_OUT]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
    },
    data() {
        return {
            provider: {
                items: [],
                busy: false,
                meta: {
                    limit: 10,
                    offset: 0,
                    total: 0,
                },
            },
            error: null,
            busy: false,
            form: {
                name: '',
                password: '',
            },
        };
    },
    validations: {
        form: {
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(255),
            },
            password: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(255),
            },
        },
    },
    computed: {
        providerQuery() : BuildInput<IdentityProvider> {
            return {
                include: {
                    realm: true,
                },
                filter: {
                    realm_id: {
                        operator: '!',
                        value: 'master',
                    },
                },
                sort: {
                    created_at: 'DESC',
                },
            };
        },
    },
    methods: {
        async submit() {
            if (this.busy) return;

            this.busy = true;
            this.error = null;

            try {
                const { name, password } = this.form;

                await this.$store.dispatch('auth/triggerLogin', { name, password });

                await this.$nuxt.$router.push(this.$nuxt.$router.history.current.query.redirect || '/');
            } catch (e) {
                if (e instanceof Error) {
                    this.$bvToast.toast(e.message, {
                        toaster: 'b-toaster-top-center',
                        variant: 'warning',
                    });
                }
            }

            this.busy = false;
        },

        buildUrl(provider) {
            return this.$authApi.identityProvider.getAuthorizeUri(this.$config.apiUrl, provider.id);
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const h = createElement;
        const name = buildFormInput(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Name / E-Mail',
            propName: 'name',
        });
        const password = buildFormInput(vm, h, {
            validationTranslator: buildVuelidateTranslator(this.$ilingo),
            title: 'Passwort',
            propName: 'password',
            attrs: {
                type: 'password',
            },
        });
        const submit = buildFormSubmit(vm, h, {
            createIconClass: 'fa-solid fa-right-to-bracket',
            createButtonClass: 'btn btn-secondary btn-sm btn-block',
            createText: 'Login',
        });
        return h('div', { staticClass: 'container' }, [
            h('h4', 'Login'),
            h('div', { staticClass: 'text-center' }, [
                h(MedicineWorker, {
                    props: {
                        width: 400,
                        height: 'auto',
                    },
                }),
            ]),
            h('form', {
                on: {
                    submit($event) {
                        $event.preventDefault();
                        return vm.submit.call(null);
                    },
                },
            }, [
                h('div', { staticClass: 'row' }, [
                    h('div', { staticClass: 'col-12 col-sm-6' }, [
                        h('h6', 'Master'),
                        name,
                        password,
                        submit,
                    ]),
                    h('div', { staticClass: 'col-12 col-sm-6' }, [
                        h('h6', 'Stations'),
                        h(IdentityProviderList, {
                            props: {
                                query: vm.providerQuery,
                                withSearch: false,
                            },
                            scopedSlots: {
                                [SlotName.ITEM]: (props) => h('div', {
                                    staticClass: 'd-flex flex-wrap flex-row',
                                }, [
                                    h('div', [
                                        h('strong', props.item.realm.name),
                                        h('span', { staticClass: 'ml-2 badge badge-dark' }, [props.item.name]),
                                    ]),
                                    h('div', { staticClass: 'ml-auto' }, [
                                        h('a', {
                                            attrs: {
                                                href: vm.buildUrl(props.item),
                                                type: 'button',
                                            },
                                            staticClass: 'btn btn-success btn-xs',
                                        }, [
                                            'Login',
                                        ]),
                                    ]),
                                ]),
                            },
                        }),
                    ]),
                ]),
            ]),
        ]);
    },
});
</script>
