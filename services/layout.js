import layout from './../config/layout';

// --------------------------------------------------------------------

const LayoutService = {
  getNavigation: () => {
    return layout.navigation
  },
  // --------------------------------------------------------------------

  getSidebarById: (id) => {
    return id in layout.sidebars ? layout.sidebars[id] : layout.sidebars.default;
  },

  // --------------------------------------------------------------------

  reduceComponents: ({ components, loggedIn }) => {
    return components.filter((component) => {
      if ('requireLoggedIn' in component && component.requireLoggedIn && !loggedIn) {
        return false
      }

      if ('requireLoggedOut' in component && component.requireLoggedOut && loggedIn) {
        return false
      }

      return true;
    })
  }
};

export { LayoutService }
