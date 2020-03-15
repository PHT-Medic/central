export default function ({ store, route }) {
  const sidebar = {
    id: store.getters['layout/sidebarId']
  };

  if ('sidebarId' in route.meta && route.meta.sidebarId) {
    sidebar.id = route.meta.sidebarId
  }

  store.dispatch('layout/selectSidebar', sidebar.id)
}
