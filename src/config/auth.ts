const AuthConfig = {
    /**
     * Users created on 'npm run run-seed'.
     */
    users: [
        {name: 'admin', password: 'start123', email: 'peter.placzek1996@gmail.com'},
    ],
    /**
     * Permissions created on 'npm run run-seed'.
     */
    permissions: [
        {name: 'admin_ui_use'},

        {name: 'permission_add'},
        {name: 'permission_drop'},
        {name: 'permission_edit'},

        {name: 'user_add'},
        {name: 'user_drop'},
        {name: 'user_edit'},

        {name: 'user_permission_add'},
        {name: 'user_permission_drop'},
    ]
}

export default AuthConfig;
