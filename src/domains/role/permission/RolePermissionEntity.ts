interface RolePermissionEntity {
    role_id: number,
    permission_id: number,
    scope?: string | null | object,
    condition?: string | null | object,
    created_at?: string,
    updated_at?: string
}

export default RolePermissionEntity;
