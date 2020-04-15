export default {
  sidebars: {
    admin: [
      {
        name: 'Allgemein',
        type: 'separator',
        requireLoggedIn: true
      },
      {
        name: 'Dashboard',
        type: 'link',
        value: '/admin',
        icon: 'fas fa-tachometer-alt',
        subcomponents: false,
        requireLoggedIn: true
      },
      {
        name: 'Users',
        type: 'link',
        value: '/admin/users',
        icon: 'fas fa-user',
        subcomponents: false,
        requireLoggedIn: true
      }
    ],
    default: [
      {
        name: 'Allgemein',
        type: 'separator',
        requireLoggedIn: true
      },
      {
        name: 'Dashboard',
        type: 'link',
        value: '/',
        icon: 'fas fa-tachometer-alt',
        subcomponents: false,
        requireLoggedIn: true
      },
      {
        name: 'Antrag',
        type: 'separator',
        requireLoggedIn: true
      },
      {
        name: 'Antrag erstellen',
        type: 'link',
        value: '/proposals/add',
        icon: 'fas fa-plus',
        subcomponents: false,
        requireLoggedIn: true
      },
      {
        name: 'Anträge',
        type: 'link',
        value: '/proposals',
        icon: 'fas fa-bars',
        subcomponents: false,
        requireLoggedIn: true
      },
      {
        name: 'Login',
        type: 'link',
        value: '/login',
        icon: 'fas fa-sign',
        subcomponents: false,
        requireLoggedOut: true
      }
    ]
  },
  navigation: [
    {
      name: 'Allgemein',
      value: null,
      icon: null,
      sidebarId: 'default'
    },
    {
      name: 'Admin',
      value: null,
      icon: null,
      sidebarId: 'admin'
    }
  ]
};
