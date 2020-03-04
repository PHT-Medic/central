<template>
    <div class="page-sidebar">
        <div class="sidebar-header">
            <h3>PHT - Personal Health Train</h3>
        </div>
        <ul class="sidebar-menu">
            <li v-for="(value,key) in sidebarComponents" v-bind:key="key">
                <div v-if="value.separator" class="nav-separator">{{value.separator}}</div>
                <span v-if="!value.subcomponents">
                     <router-link :to="value.link" v-html="value.name" class="sidebar-menu-link"></router-link>
                </span>
                <span v-if="value.subcomponents">
                    <span class="sidebar-submenu-title" v-html="value.name"></span>
                    <ul class="list-unstyled sidebar-submenu-components">
                        <li v-for="(subValue,subKey) in value.subcomponents" v-bind:key="subKey">
                            <router-link :to="subValue.link" v-html="subValue.name" class="sidebar-menu-link"></router-link>
                        </li>
                    </ul>
                </span>
            </li>
        </ul>
    </div>
</template>
<script>
    import {mapGetters} from "vuex";

	export default {
        components: {},
        computed: {
			...mapGetters('auth',[
				'loggedIn'
			]),

            sidebarComponents: vm => {
				let components = [];

				if(vm.loggedIn) {
					components = [
						{name: 'Dashboard', link: '/dashboard', subcomponents: false, separator: 'Allgemein'},
						{name: 'Antrag', link: false, subcomponents: [
								{name: 'Erstellen', link: '/train/proposal-add'},
								{name: 'Liste', link: '/train/proposals'}
							], separator: 'Zug'},
						{name: 'Sendung', link: false, subcomponents: [
								{name: 'Erstellen', link: '/train/consignment-add'},
								{name: 'Liste (Status)', link: '/train/consignments'}
							], separator: false},
						{name: 'Zug', link: false, subcomponents: [
								{name: 'Stationen', link: '/admin/train/stations'},
								{name: 'Anträge', link: '/admin/train/proposals'}
							], separator: 'Administration'},
						{name: 'Benutzer', link: '/admin/users', subcomponents: false, separator: false},
						{name: 'Profile', link: '/profile', subcomponents: false, separator: 'Sonstiges'},
						{name: 'Logout', link: '/logout', subcomponents: false, separator: false},
					];
                } else {
					components = [
						{name: 'Login', link: '/login', subcomponents: false, separator: false}
                    ];
                }

                return components;
            }
        }
    }
</script>