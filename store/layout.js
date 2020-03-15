import { LayoutService } from './../services/layout';

// --------------------------------------------------------------------

const defaultSidebarId = 'default';

// --------------------------------------------------------------------

const state = () => ({
  sidebarId: defaultSidebarId,
  sidebarComponents: [],
  sidebarComponentsLoaded: false,

  navigationComponents: LayoutService.getNavigation()
});

const getters = {
  sidebarId: (state) => {
    return state.sidebarId
  },
  sidebarComponents: (state, getters) => {
    return state.sidebarComponents;
  },
  navigationComponents: (state, getters) => {
    return state.navigationComponents;
  }
};

const actions = {
  selectSidebar ({ commit, state }, id) {
    id = id === undefined ? defaultSidebarId : id;

    if (state.sidebarId === id && state.sidebarComponentsLoaded) {
      return;
    }

    const data = LayoutService.getSidebarById(id);

    commit('setSidebarId', id);
    commit('setSidebarComponents', data)
  }
};

const mutations = {
  setSidebarId (state, id) {
    state.sidebarId = id
  },
  setSidebarComponents (state, menu) {
    state.sidebarComponents = menu;
    state.sidebarComponentsLoaded = true
  }
};

// --------------------------------------------------------------------

export {
  state,
  getters,
  actions,
  mutations
}
