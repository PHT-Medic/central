import UserService from "../services/user/user";
import {mapActions, mapGetters} from "vuex";
import {maxLength, minLength, required, email} from "vuelidate/lib/validators";

const userGeneralFormMixin = {
    computed: {
        ...mapGetters('auth', [
            'loggedIn',
            'user'
        ])
    },
    data() {
        return {
            userGeneralForm: {
                name: '',
                email: '',

                message: null,
                busy: false
            },
            userData: null
        }
    },
    validations: {
        userGeneralForm: {
            name: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(30)
            },
            email: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(255),
                email
            },
        }
    },
    methods: {
        ...mapActions('auth',[
            'triggerSetUserProperty'
        ]),
        whichFieldsAreModified(properties) {
            let fields = [];

            for(let property in properties) {
                if(!properties.hasOwnProperty(property)){
                    continue;
                }

                switch (property) {
                    default:
                        if(this.userData[property] !== properties[property]) {
                            fields.push(property);
                        };
                        break;
                }
            }

            if(fields.length > 0) {
                return fields;
            }

            return false;
        },
        async submitGeneralForm(event) {
            event.preventDefault();

            if(this.userGeneralForm.busy) {
                return;
            }

            this.userGeneralForm.busy = true;

            try {
                let {name, email} = this.userGeneralForm;

                let fields = this.whichFieldsAreModified({name, email});

                if(fields.length > 0) {
                    await UserService.setUserProperties(this.userData.id, {name, email});

                    if(this.userData.id === this.user.id) {
                        this.triggerSetUserProperty({property: 'name', value: name});
                        this.triggerSetUserProperty({property: 'email', value: email})
                    }

                    this.userData.name = name;
                    this.userData.email = email;

                    this.userGeneralForm.message = {
                        isError: false,
                        data: 'Die Attribute wurden erfolgreich aktualisiert.'
                    }
                } else {
                    this.userGeneralForm.message = {
                        isError: false,
                        data: 'Die Attribute wurden nicht geändert.'
                    }
                }
            } catch (e) {
                this.userGeneralForm.message = {
                    isError: true,
                    data: e.message
                }
            }

            this.userGeneralForm.busy = false;
        },
    }
};

export default userGeneralFormMixin;
