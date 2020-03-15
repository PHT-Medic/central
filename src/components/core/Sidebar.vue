<template>
    <div class="page-sidebar">
        <div class="sidebar-header">
            <h3>PHT - Personal Health Train</h3>
        </div>
        <ul class="sidebar-menu">
            <li v-for="(component,key) in sidebarComponents" v-bind:key="key">
                <div v-if="component.type === 'separator'" class="nav-separator">
                    {{component.name}}
                </div>
                <div v-if="component.type === 'link'">
                    <span v-if="!component.subcomponents">
                         <router-link :to="component.value" class="sidebar-menu-link">
                             <i v-if="component.icon" v-bind:class="component.icon"></i> {{component.name}}
                         </router-link>
                    </span>
                    <span v-if="component.subcomponents">
                        <span class="sidebar-submenu-title" v-html="component.name"></span>
                        <ul class="list-unstyled sidebar-submenu-components">
                            <li v-for="(subValue,subKey) in component.subcomponents" v-bind:key="subKey">
                                <router-link :to="subValue.link" class="sidebar-menu-link">
                                    <i v-if="component.icon" v-bind:class="component.icon"></i> {{subValue.name}}
                                </router-link>
                            </li>
                        </ul>
                    </span>
                </div>
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
						{name: 'Übersicht', type: 'link', value: '/dashboard', subcomponents: false, separator: 'Allgemein'},
						{name: 'Erstellen', type: 'link', value: '/proposals/add', subcomponents: false, separator: false},
						{name: 'Antrag', type: 'link', value: false, subcomponents: [
								{name: 'Erstellen', type: 'link', value: '/train/proposal-add'},
								{name: 'Liste', type: 'link', value: '/train/proposals'}
							], separator: 'Zug'},
						{name: 'Sendung', type: 'link', value: false, subcomponents: [
								{name: 'Erstellen', type: 'link', value: '/train/consignment-add'},
								{name: 'Liste (Status)', type: 'link', value: '/train/consignments'}
							], separator: false},
                        {name: 'Administration'},
						{name: 'Zug', type: 'link', value: false, subcomponents: [
								{name: 'Stationen', type: 'link', value: '/admin/train/stations'},
								{name: 'Anträge', type: 'link', value: '/admin/train/proposals'}
							], separator: 'Administration'},
						{name: 'Benutzer', type: 'link', value: '/admin/users', subcomponents: false},

                        {name: 'Sonstiges', type: 'separator'},
						{name: 'Profile', type: 'link', value: '/profile', subcomponents: false, separator: 'Sonstiges'},
						{name: 'Logout', type: 'link', value: '/logout', subcomponents: false},
					];
                } else {
					components = [
						{name: 'Login', type: 'link', value: '/login', subcomponents: false}
                    ];
                }

                return components;
            }
        }
    }
</script>