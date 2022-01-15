<script>
export default {
    props: {
        userRoles: {
            type: Array,
            default: () => [],
        },
        primaryParameter: {
            type: String,
            default: 'role',
        },
        roleId: Number,
        userId: Number,
    },
    data() {
        return {
            busy: false,
        };
    },
    computed: {
        userRoleIndex() {
            return this.userRoles.findIndex((userRole) => (this.primaryParameter === 'role' ? userRole.role_id === this.roleId : userRole.user_id === this.userId));
        },
        isInUserRoles() {
            return this.userRoleIndex !== -1;
        },
    },
    methods: {
        async add() {
            if (this.busy) return;

            this.busy = true;

            try {
                const userRole = await this.$authApi.userRole.getMany({
                    role_id: this.roleId,
                    user_id: this.userId,
                });

                this.$emit('added', userRole);
            } catch (e) {
                // ...
            }

            this.busy = false;
        },
        async drop() {
            if (this.busy || this.userRoleIndex === -1) return;

            this.busy = true;

            try {
                const userRole = await this.$authApi.userRole.delete(this.userRoles[this.userRoleIndex].id);

                this.$emit('dropped', userRole);
            } catch (e) {

            }

            this.busy = false;
        },
    },
};
</script>
<template>
    <div>
        <button
            v-if="!isInUserRoles"
            class="btn btn-xs btn-success"
            @click.prevent="add"
        >
            <i class="fa fa-plus" />
        </button>
        <button
            v-if="isInUserRoles"
            class="btn btn-xs btn-danger"
            @click.prevent="drop"
        >
            <i class="fa fa-trash" />
        </button>
    </div>
</template>
