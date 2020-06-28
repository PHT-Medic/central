interface PermissionEntity {
    id?: number,
    name: string,
    title?: string | null,
    description?: string | null,
    power_configurable?: boolean,
    power_inverse_configurable?: boolean,
    scope_configurable?: boolean,
    created_at?: string | number,
    updated_at?: string | number
}

export default PermissionEntity;
