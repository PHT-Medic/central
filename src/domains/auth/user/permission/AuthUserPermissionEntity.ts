interface AuthUserPermissionEntity {
    user_id: number,
    permission_id: number,
    scope: object | string | null,
    created_at: string,
    updated_at: string
}

export default AuthUserPermissionEntity;
