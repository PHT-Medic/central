import ApiService from './../services/api';
import { AuthService } from './../services/auth';

export default ({ app, env }) => {
  ApiService.init(env.apiUrl);
  AuthService.checkRequestToken();

  app.store.dispatch('auth/refreshMe');
};
