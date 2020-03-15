import { ApiService } from './../services/api';
import { AuthService } from './../services/auth';

export default ({ app }) => {
  ApiService.init('http://localhost:7001');
  AuthService.checkRequestToken();

  app.store.dispatch('auth/refreshMe');
};
