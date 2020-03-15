import baseRoutes from './base'
import trainRoutes from './train'

/**
 * Concat all routes.
 *
 * @type {*[]}
 */
const routes = [].concat(baseRoutes, trainRoutes)
export default routes
