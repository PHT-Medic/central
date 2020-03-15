module.exports = {
  sidebars: {
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
        name: 'Login',
        type: 'link',
        value: '/login',
        icon: 'fas fa-sign',
        subcomponents: false,
        requireLoggedOut: true
      }
    ]
  },
  navigation: []
};
