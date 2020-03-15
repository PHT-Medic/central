import { ApiService } from './../services/api';
import { AuthService } from './../services/auth';

export default ({ app }) => {
  ApiService.init('http://localhost:4001');
  AuthService.checkRequestToken();

  app.store.dispatch('auth/refreshMe');
};
