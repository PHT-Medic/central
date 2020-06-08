<script>
    import NotImplemented from "../../../../components/NotImplemented";
    import PermissionEdge from "../../../../services/edge/permission/permissionEdge";
    import AlertMessage from "../../../../components/alert/AlertMessage";
    import userPasswordFormMixin from "../../../../mixins/userPasswordFormMixin";

    export default {
        props: {
            providedUser: {
                type: Object
            }
        },
        mixins: [
            userPasswordFormMixin
        ],
        components: {
            AlertMessage,
            NotImplemented
        },
        async asyncData(context) {
            let permissions = [];

            try {
                permissions = await PermissionEdge.getPermissions();
            } catch (e) {
                context.redirect('/admin/users');
            }

            return {
                permissions
            }
        },
        data() {
            return {
                permissions: []
            }
        },
        created() {
            this.userData = this.providedUser;
        }
    }
</script>
<template>
    <div>
        <div class="row">
            <div class="col-5">
                <div class="panel-card">
                    <div class="panel-card-header">
                        <h6 class="title">
                            Berechtigungen
                        </h6>
                    </div>
                    <div class="panel-card-body">
                        <alert-message
                            :message="{
                            isError: false,
                            data: 'Aktivieren oder deaktivieren Sie Benutzer-Berechtigungen.'
                        }" />

                        <b-list-group class="overflow-auto" style="height:500px;">
                            <b-list-group-item v-for="(item,key) in permissions" class="flex-column align-items-start" :key="key">
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1 font-weight-bold">{{item.name}}</h6>
                                    <b-form-checkbox switch />
                                </div>
                            </b-list-group-item>
                        </b-list-group>
                    </div>
                </div>
            </div>
            <div class="col-4">
                <div class="panel-card">
                    <div class="panel-card-header">
                        <h6 class="title">
                            Passwort
                        </h6>
                    </div>
                    <div class="panel-card-body">
                        <alert-message :message="userPasswordForm.message" />

                        <div class="form-group" :class="{ 'form-group-error': $v.userPasswordForm.password.$error }">
                            <label>Passwort</label>
                            <input v-model="$v.userPasswordForm.password.$model" type="password" name="name" class="form-control" placeholder="Passwort...">

                            <div v-if="!$v.userPasswordForm.password.required" class="form-group-hint group-required">
                                Bitte geben Sie einen Benutzernamen an.
                            </div>
                            <div v-if="!$v.userPasswordForm.password.minLength" class="form-group-hint group-required">
                                Der Benutzername muss mindestens <strong>{{ $v.userPasswordForm.password.$params.minLength.min }}</strong> Zeichen lang sein.
                            </div>
                            <div v-if="!$v.userPasswordForm.password.maxLength" class="form-group-hint group-required">
                                Der Benutzername darf maximal <strong>{{ $v.userPasswordForm.password.$params.maxLength.max }}</strong> Zeichen lang sein.
                            </div>
                        </div>

                        <div class="form-group" :class="{ 'form-group-error': $v.userPasswordForm.passwordRepeat.$error }">
                            <label>Passwort wiederholen</label>
                            <input v-model="$v.userPasswordForm.passwordRepeat.$model" type="password" name="name" class="form-control" placeholder="Passwort wiederholen...">

                            <div v-if="!$v.userPasswordForm.passwordRepeat.required" class="form-group-hint group-required">
                                Bitte geben Sie einen Benutzernamen an.
                            </div>
                            <div v-if="!$v.userPasswordForm.passwordRepeat.minLength" class="form-group-hint group-required">
                                Der Benutzername muss mindestens <strong>{{ $v.userPasswordForm.passwordRepeat.$params.minLength.min }}</strong> Zeichen lang sein.
                            </div>
                            <div v-if="!$v.userPasswordForm.passwordRepeat.maxLength" class="form-group-hint group-required">
                                Der Benutzername darf maximal <strong>{{ $v.userPasswordForm.passwordRepeat.$params.maxLength.max }}</strong> Zeichen lang sein.
                            </div>
                            <div v-if="!$v.userPasswordForm.passwordRepeat.sameAsPassword" class="form-group-hint group-required">
                                Die Passwörter sind nicht identisch...
                            </div>
                        </div>

                        <hr>

                        <div class="form-group">
                            <button :disabled="$v.userPasswordForm.$invalid || userPasswordForm.busy" @click="submitPasswordForm" type="submit" class="btn btn-primary btn-xs"><i class="fa fa-save"></i> Ändern</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
