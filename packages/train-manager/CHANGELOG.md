# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.3.2](https://github.com/PHT-Medic/central/compare/v2.3.1...v2.3.2) (2023-04-04)


### Bug Fixes

* module imports + renamed http-client to api-client ([88440d2](https://github.com/PHT-Medic/central/commit/88440d276b926e4eabe57ac39460183b3b8e95a7))





## [2.3.1](https://github.com/PHT-Medic/central/compare/v2.3.0...v2.3.1) (2023-04-03)


### Bug Fixes

* **deps:** bump authup to v0.32.0 ([f3cccb9](https://github.com/PHT-Medic/central/commit/f3cccb9a559e35da6b3956802b4ecb6f914163f4))





# [2.3.0](https://github.com/PHT-Medic/central/compare/v2.2.1...v2.3.0) (2023-04-03)


### Bug Fixes

* **deps:** bump redis-extension from 1.2.3 to 1.3.0 ([#923](https://github.com/PHT-Medic/central/issues/923)) ([eae6865](https://github.com/PHT-Medic/central/commit/eae68658ac50a376fada9906276d8e904e987dd0))


### Features

* bump authup to v0.31.2 ([5b744a9](https://github.com/PHT-Medic/central/commit/5b744a9a36978545ea857a829f63e9cd9543e187))





## [2.2.1](https://github.com/PHT-Medic/central/compare/v2.2.0...v2.2.1) (2023-03-31)

**Note:** Version bump only for package @personalhealthtrain/train-manager





# [2.2.0](https://github.com/PHT-Medic/central/compare/v2.1.2...v2.2.0) (2023-03-30)


### Bug Fixes

* **deps:** bump @authup/common from 0.22.0 to 0.24.0 ([#920](https://github.com/PHT-Medic/central/issues/920)) ([0dc02ba](https://github.com/PHT-Medic/central/commit/0dc02ba7d6d71261770242126c246b7d091fbedd))
* **deps:** bump @authup/server-adapter from 0.22.0 to 0.24.0 ([#918](https://github.com/PHT-Medic/central/issues/918)) ([8e1e693](https://github.com/PHT-Medic/central/commit/8e1e693de4586c016d5339e57094336542b1bb25))


### Features

* pull docker master-image before building image ([3f5cc42](https://github.com/PHT-Medic/central/commit/3f5cc428316fd95ee4eaa80ec1b0d099554adb07))





## [2.1.2](https://github.com/PHT-Medic/central/compare/v2.1.1...v2.1.2) (2023-03-29)


### Bug Fixes

* minor logging enhancements ([0156426](https://github.com/PHT-Medic/central/commit/01564261eb8c8346f238d0cdb46214f72474c52b))
* router check command for incoming & outgoing repository ([8314b9e](https://github.com/PHT-Medic/central/commit/8314b9e4336ce346cfedaddb8f737aedb3758141))





# [2.1.0](https://github.com/PHT-Medic/central/compare/v2.0.0...v2.1.0) (2023-03-28)


### Bug Fixes

* **deps:** bump authup + reduced explicit dependencies ([7b7021f](https://github.com/PHT-Medic/central/commit/7b7021f86b12fa2ae15e6384fd050fe76a5cf49f))
* renamed AUTH_API_URL to AUTHUP_API_URL ([8519bd4](https://github.com/PHT-Medic/central/commit/8519bd4b9dab78a40a5e555915515d705dd0d8a7))
* replace beader with basic authorization header for testing ([af320df](https://github.com/PHT-Medic/central/commit/af320df098c995848fe1a09ee9953dcd50c85995))


### Features

* split api package ([#900](https://github.com/PHT-Medic/central/issues/900)) ([6be0436](https://github.com/PHT-Medic/central/commit/6be04364ccefe46ac579f29b1839a00598a3694c))





# [2.0.0](https://github.com/PHT-Medic/central/compare/v2.0.0-alpha.0...v2.0.0) (2023-03-25)


### Bug Fixes

* **deps:** bump authup to v0.17.2 ([6d500a0](https://github.com/PHT-Medic/central/commit/6d500a0390ecea4e19e107ecb5f476e8b13b8fcf))





# [2.0.0-alpha.0](https://github.com/PHT-Medic/central/compare/v1.4.0...v2.0.0-alpha.0) (2023-03-20)


### Bug Fixes

* add missing train router event aggregation ([3d32e81](https://github.com/PHT-Medic/central/commit/3d32e81307b666818f39943d3ab00dd809984009))
* api freeze on illegal cache chars + added mjs support for ui ([aa6ef9f](https://github.com/PHT-Medic/central/commit/aa6ef9fd9a78cbe902a6b6618cc144e66659b73f))
* change query path location for train build ([33c0ff4](https://github.com/PHT-Medic/central/commit/33c0ff4e6bec36f4287d6ef4b2ed06a6571b5330))
* **deps:** bump @authelion/* dependencies ([cc65e2f](https://github.com/PHT-Medic/central/commit/cc65e2fb443177cf3b093533f4bb864eb9fd3ec2))
* **deps:** bump @authelion/* packages ([5e4bb05](https://github.com/PHT-Medic/central/commit/5e4bb05c87d96fdac348e7089d349b8af35d1d61))
* **deps:** bump @hapic/vault from 1.1.0 to 1.2.0 ([#812](https://github.com/PHT-Medic/central/issues/812)) ([7ab5b00](https://github.com/PHT-Medic/central/commit/7ab5b00bd13e0b751434bef15a109bbecd2c6245))
* **deps:** bump authelion ([9a1e07a](https://github.com/PHT-Medic/central/commit/9a1e07a5ac6b0f09d309cb52699f6ed10a4fb8c2))
* **deps:** bump authup & routup dependency ([fccfeb3](https://github.com/PHT-Medic/central/commit/fccfeb3e5d34e9441b0829922f41f177fb5939f8))
* **deps:** bump dockerode and @types/dockerode ([#886](https://github.com/PHT-Medic/central/issues/886)) ([118a840](https://github.com/PHT-Medic/central/commit/118a8400753a7adfe6d65156e1f84942b82b4d94))
* **deps:** bump hapic to v1.2.1 ([aa5db1d](https://github.com/PHT-Medic/central/commit/aa5db1dec946c39cfb889f8fc0dcde5b3764d1c4))
* **deps:** bump hapic to v1.3 and adjusted code base ([1dd9d03](https://github.com/PHT-Medic/central/commit/1dd9d031f5d99fec1282463873643096bbb943ae))
* **deps:** bump rapiq from 0.6.3 to 0.6.4 ([#738](https://github.com/PHT-Medic/central/issues/738)) ([48bcac8](https://github.com/PHT-Medic/central/commit/48bcac84353bb5e2bc266be4510663dcc246c837))
* **deps:** bump rapiq from 0.7.0 to 0.8.0 ([#825](https://github.com/PHT-Medic/central/issues/825)) ([84f4e92](https://github.com/PHT-Medic/central/commit/84f4e923cda1c6c02f32018e20d9815bce6a2d38))
* **deps:** bump redis-extension from 1.2.0 to 1.2.1 ([#754](https://github.com/PHT-Medic/central/issues/754)) ([97276d5](https://github.com/PHT-Medic/central/commit/97276d5a1c5d6e103e26f6f9daa6bbd653ced454))
* **deps:** bump redis-extension from 1.2.2 to 1.2.3 ([#793](https://github.com/PHT-Medic/central/issues/793)) ([b174de7](https://github.com/PHT-Medic/central/commit/b174de790ba977921df37ab4f454f93f7766abc6))
* **deps:** updated authup & routup dependencies ([7c57ef8](https://github.com/PHT-Medic/central/commit/7c57ef893c9ef57143bdaa0820a320f3f9a72189))
* enhance logging for refreshing token ([3774282](https://github.com/PHT-Medic/central/commit/3774282bb81d7537a176f36ceb0a38b55cfa0296))
* logging in train builder helper module ([cd323fb](https://github.com/PHT-Medic/central/commit/cd323fb8e3ae7a52add8af8b6619588c2a417bee))
* minor cleanup ([fa1fd3d](https://github.com/PHT-Medic/central/commit/fa1fd3dc8da694cc9cf6de382ddc45eb9d70c59a))
* minor package cleanup ([8af5b9b](https://github.com/PHT-Medic/central/commit/8af5b9baced2b431e6da080670428b899adfe004))
* prefix node core modules imports ([65e2342](https://github.com/PHT-Medic/central/commit/65e23429bac72c1d673361ab0fe58f56672f1477))
* public key encryption of symmetric key ([ecd87a2](https://github.com/PHT-Medic/central/commit/ecd87a2d84dd069998b608f0fb6c815aebd6cf4d))
* train container packing ([7e9063c](https://github.com/PHT-Medic/central/commit/7e9063c8823e1a83cd4dc5cbc61a40cf8f75367b))
* train router aggregation ([6a79a1b](https://github.com/PHT-Medic/central/commit/6a79a1bd7e31f11e5f14d601c475febce46d9056))
* train-file get many abstraction ([b0e69b5](https://github.com/PHT-Medic/central/commit/b0e69b580e9f226766e74787f84b7a0453398dbd))
* **ui:** fix typings + reset lock file ([499baa9](https://github.com/PHT-Medic/central/commit/499baa93f603f673182daf7fd529753f0fb25771))
* wronger logger for extractor component ([47439eb](https://github.com/PHT-Medic/central/commit/47439eb33a56d4a9c4573b8dde4a5fa387f44077))


### Features

* **api:** applied new queue schema ([f64385e](https://github.com/PHT-Medic/central/commit/f64385e06ec40e27484f4f326c7a0ff3e2c61372))
* cleanup trainFile api + moved code/methods to corresponding domain ([36f5382](https://github.com/PHT-Medic/central/commit/36f53820a03867dbe52ba6776d8b754389263b74))
* enhace structure, stricter typings, clearer ownership ([de360e2](https://github.com/PHT-Medic/central/commit/de360e2ff383054ad31b3ce69bf4756496f359ee))
* move setup & destroy train command to train-service ([e592cbe](https://github.com/PHT-Medic/central/commit/e592cbe4481e794303f1f30e8f361ca7d841dbf5))
* move types ownership to corresponding service ([316d08f](https://github.com/PHT-Medic/central/commit/316d08f68cf89d9780e5fd78795ee756e9643653))
* pipe train-files to gunzip ([d59bcb2](https://github.com/PHT-Medic/central/commit/d59bcb2796543ad8154a7e1197549766cf6b85c8))
* restructured and grouped components ([12e8443](https://github.com/PHT-Medic/central/commit/12e84437501534dcb60bcba9e03def6541f702d1))
* restructured package structure ([e3f7e04](https://github.com/PHT-Medic/central/commit/e3f7e04ed9ac4b8fb77b37bd0e61c8f666dc7836))
* **server-common:** initial release ([e02ddf8](https://github.com/PHT-Medic/central/commit/e02ddf89d0c3ffa096bb68aa55ab0b0dff0df433))
* started restructuring components & domains ([aa0f1da](https://github.com/PHT-Medic/central/commit/aa0f1da941b48c9560f02db9ef46cd39831fc66f))
* train-{files,query} encryption + additional rsa signing ([d5ca6b0](https://github.com/PHT-Medic/central/commit/d5ca6b0c4322e7804e07e16e7ee4d4be79784ff5))
* **train-manager:** applied new queue schema ([f713949](https://github.com/PHT-Medic/central/commit/f71394961fd6b8837e3fb6345829e3eaed8d8dad))





# [1.4.0](https://github.com/PHT-Medic/central/compare/v1.3.27...v1.4.0) (2023-01-11)


### Bug Fixes

* **deps:** bump @hapic/harbor from 0.3.0 to 1.0.0 ([2005252](https://github.com/PHT-Medic/central/commit/2005252b9352a7bed15d42c73e863b2cf8630aa0))
* **deps:** bump @hapic/vault from 0.3.0 to 1.0.0 ([77a4c78](https://github.com/PHT-Medic/central/commit/77a4c78054a58caa78ffaa973286cd2fac00e528))
* **deps:** bump hapic from 0.3.0 to 1.0.0 ([656f5a4](https://github.com/PHT-Medic/central/commit/656f5a4880db663c13ecad27f50eb5054e76d950))
* **deps:** bump rapiq from 0.6.1 to 0.6.2 ([8cffc54](https://github.com/PHT-Medic/central/commit/8cffc54eb2599b2e7c2b8399e0be125a70abb819))
* **deps:** bump rapiq from 0.6.2 to 0.6.3 ([ce5be5e](https://github.com/PHT-Medic/central/commit/ce5be5eadd4e9ac5b6d77d49d8b1a9178e7d78ef))
* **deps:** updated authup & routup libs + modified code base ([c44a22c](https://github.com/PHT-Medic/central/commit/c44a22c2f3b4ebebb7e0877c5e18697dd04a6ba7))





## [1.3.27](https://github.com/PHT-Medic/central/compare/v1.3.26...v1.3.27) (2022-10-06)

### Bug Fixes

- **deps:** bump body-parser from 1.20.0 to 1.20.1 ([6cd90c9](https://github.com/PHT-Medic/central/commit/6cd90c91850975ebfcf54ac90e949056122ae974))
- swagger documentation generation ([83f6eb0](https://github.com/PHT-Medic/central/commit/83f6eb03780d9f7d1a5d3032048426bcffacea09))
