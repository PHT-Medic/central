import TrainProposalAdd from '../components/train/TrainProposalAdd'
import TrainProposalList from '../components/train/TrainProposalList'
import TrainConsignment from '../components/train/TrainConsignment'

const routes = [
  // Train proposal
  {
    path: '/train/proposal-add',
    component: TrainProposalAdd,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/train/proposals',
    component: TrainProposalList,
    meta: {
      requiresAuth: true
    }
  },

  // Train Consignment
  {
    path: '/train/consignment',
    component: TrainConsignment,
    meta: {
      requiresAuth: true
    }
  }
]

export default routes
