# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/PHT-Medic/central/compare/v2.0.0...v2.1.0) (2023-03-28)


### Bug Fixes

* check registry robot integrity before executing webhook registration ([b0c79fd](https://github.com/PHT-Medic/central/commit/b0c79fdbccbaef8981b46b125b87e8a8e3dd466c))
* **deps:** bump authup + reduced explicit dependencies ([7b7021f](https://github.com/PHT-Medic/central/commit/7b7021f86b12fa2ae15e6384fd050fe76a5cf49f))
* **deps:** bump locter from 1.0.10 to 1.1.0 ([#903](https://github.com/PHT-Medic/central/issues/903)) ([b753ecc](https://github.com/PHT-Medic/central/commit/b753ecc8479773f79ed1037a84999c776df045eb))
* log setup error on execution failure ([be0089c](https://github.com/PHT-Medic/central/commit/be0089c2cec258de7ea20e2964a8669dcddbd47f))
* only mount rate-limit-,prometheus- & license-agreemenet-middleware on non test env ([19335ac](https://github.com/PHT-Medic/central/commit/19335ac2098c38239f6a9b78781c88944f1d9a20))
* purify database sub module ([990cc22](https://github.com/PHT-Medic/central/commit/990cc2286b9603ae90ed3666ff6f45ed9267418a))
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
* **api:** swagger generation for train-files ([b689fe0](https://github.com/PHT-Medic/central/commit/b689fe0aa2b1b65df6e042719b87670b0329f29c))
* better naming for http/api command enums ([99b71f2](https://github.com/PHT-Medic/central/commit/99b71f287fc4ffe43fcdd6f59cbcba9993f8b0bb))
* change query path location for train build ([33c0ff4](https://github.com/PHT-Medic/central/commit/33c0ff4e6bec36f4287d6ef4b2ed06a6571b5330))
* cleanup env loading + define ci services ([f7b7044](https://github.com/PHT-Medic/central/commit/f7b7044ce90eded94441e166673f6c4c4991568e))
* cleanup train commands ( + resolving) ([4c6a259](https://github.com/PHT-Medic/central/commit/4c6a25925f54a0bd436b32b435a64b81fb171853))
* **deps:** bump [@socket](https://github.com/socket).io/redis-emitter from 5.0.0 to 5.1.0 ([1ccf340](https://github.com/PHT-Medic/central/commit/1ccf34038239e5c5f546b118ab5a31fb189ea609))
* **deps:** bump @authelion/* dependencies ([cc65e2f](https://github.com/PHT-Medic/central/commit/cc65e2fb443177cf3b093533f4bb864eb9fd3ec2))
* **deps:** bump @authelion/* packages ([5e4bb05](https://github.com/PHT-Medic/central/commit/5e4bb05c87d96fdac348e7089d349b8af35d1d61))
* **deps:** bump @authup/server-http from 0.14.0 to 0.14.1 ([#779](https://github.com/PHT-Medic/central/issues/779)) ([a6a4da0](https://github.com/PHT-Medic/central/commit/a6a4da0f4d1e0dae18c7ff39be65aa7cf8a1d13d))
* **deps:** bump @hapic/harbor + remove direct axios dep ([f3971b3](https://github.com/PHT-Medic/central/commit/f3971b3e3bb731c1dca5162c3031c8a1cd429805))
* **deps:** bump @hapic/vault from 1.1.0 to 1.2.0 ([#812](https://github.com/PHT-Medic/central/issues/812)) ([7ab5b00](https://github.com/PHT-Medic/central/commit/7ab5b00bd13e0b751434bef15a109bbecd2c6245))
* **deps:** bump @routup/body from 0.6.0 to 0.7.0 ([#757](https://github.com/PHT-Medic/central/issues/757)) ([62caeff](https://github.com/PHT-Medic/central/commit/62caeffac45ec3dacccc9f9e4c59b473d17cfc5d))
* **deps:** bump @routup/decorators from 0.4.0 to 0.5.0 ([#761](https://github.com/PHT-Medic/central/issues/761)) ([eab9e8e](https://github.com/PHT-Medic/central/commit/eab9e8e7529f90525f393bcaedb14e17370f2e41))
* **deps:** bump @routup/query from 0.6.0 to 0.7.0 ([#762](https://github.com/PHT-Medic/central/issues/762)) ([390ad6a](https://github.com/PHT-Medic/central/commit/390ad6aed4ec6dcc2b0c4a0bf912500e8ab72669))
* **deps:** bump @routup/swagger from 0.9.0 to 0.10.0 ([#756](https://github.com/PHT-Medic/central/issues/756)) ([c47f39d](https://github.com/PHT-Medic/central/commit/c47f39dfed0cf561ac747b8a29c6315a2203d117))
* **deps:** bump authelion ([9a1e07a](https://github.com/PHT-Medic/central/commit/9a1e07a5ac6b0f09d309cb52699f6ed10a4fb8c2))
* **deps:** bump authup & routup dependency ([fccfeb3](https://github.com/PHT-Medic/central/commit/fccfeb3e5d34e9441b0829922f41f177fb5939f8))
* **deps:** bump axios from 1.2.2 to 1.2.3 ([#740](https://github.com/PHT-Medic/central/issues/740)) ([0cd8b4c](https://github.com/PHT-Medic/central/commit/0cd8b4ceb7292cf720361770eff279ad7f058199))
* **deps:** bump axios from 1.2.2 to 1.2.4 ([#758](https://github.com/PHT-Medic/central/issues/758)) ([043f80f](https://github.com/PHT-Medic/central/commit/043f80f6abf17f44a67b0a77bcfe690fb8e6347f))
* **deps:** bump axios from 1.2.6 to 1.3.0 ([#786](https://github.com/PHT-Medic/central/issues/786)) ([945f655](https://github.com/PHT-Medic/central/commit/945f6554f7fdecb81e098650823651539f1f08bf))
* **deps:** bump axios from 1.3.0 to 1.3.1 ([#792](https://github.com/PHT-Medic/central/issues/792)) ([8931f19](https://github.com/PHT-Medic/central/commit/8931f1933870df0b0fac2ebd1e332dbd23f8cc60))
* **deps:** bump axios from 1.3.1 to 1.3.2 ([#801](https://github.com/PHT-Medic/central/issues/801)) ([e997859](https://github.com/PHT-Medic/central/commit/e9978593a069fd427d7fcd8ab2de0066657a325f))
* **deps:** bump express-validator from 6.14.2 to 6.14.3 ([#750](https://github.com/PHT-Medic/central/issues/750)) ([16092e1](https://github.com/PHT-Medic/central/commit/16092e17cc5052ce4e2f853585420d38863ea173))
* **deps:** bump hapic to v1.2.1 ([aa5db1d](https://github.com/PHT-Medic/central/commit/aa5db1dec946c39cfb889f8fc0dcde5b3764d1c4))
* **deps:** bump hapic to v1.3 and adjusted code base ([1dd9d03](https://github.com/PHT-Medic/central/commit/1dd9d031f5d99fec1282463873643096bbb943ae))
* **deps:** bump locter from 1.0.3 to 1.0.5 ([#828](https://github.com/PHT-Medic/central/issues/828)) ([8e4b554](https://github.com/PHT-Medic/central/commit/8e4b55438d3865bb01fd12f2d7662749645c65c6))
* **deps:** bump locter to v1.x ([406bdd3](https://github.com/PHT-Medic/central/commit/406bdd32c6de813ad9226d0e7da65c3210dd4294))
* **deps:** bump pg from 8.8.0 to 8.9.0 ([#773](https://github.com/PHT-Medic/central/issues/773)) ([915a6ef](https://github.com/PHT-Medic/central/commit/915a6ef8bdae52722b256b833b327a351fcfc726))
* **deps:** bump pg from 8.9.0 to 8.10.0 ([#879](https://github.com/PHT-Medic/central/issues/879)) ([592e2d0](https://github.com/PHT-Medic/central/commit/592e2d0167c16a067b213f0a765730a1d8da2606))
* **deps:** bump prom-client from 14.1.1 to 14.2.0 ([#875](https://github.com/PHT-Medic/central/issues/875)) ([c806a7e](https://github.com/PHT-Medic/central/commit/c806a7e815e3e968b7cb7382226f6a53d3f4fc9e))
* **deps:** bump rapiq from 0.6.3 to 0.6.4 ([#738](https://github.com/PHT-Medic/central/issues/738)) ([48bcac8](https://github.com/PHT-Medic/central/commit/48bcac84353bb5e2bc266be4510663dcc246c837))
* **deps:** bump rapiq from 0.6.4 to 0.6.6 ([0bcc236](https://github.com/PHT-Medic/central/commit/0bcc2369a0413c54c821ef0ebd86fdb908fca670))
* **deps:** bump rapiq from 0.7.0 to 0.8.0 ([#825](https://github.com/PHT-Medic/central/issues/825)) ([84f4e92](https://github.com/PHT-Medic/central/commit/84f4e923cda1c6c02f32018e20d9815bce6a2d38))
* **deps:** bump redis-extension from 1.2.0 to 1.2.1 ([#754](https://github.com/PHT-Medic/central/issues/754)) ([97276d5](https://github.com/PHT-Medic/central/commit/97276d5a1c5d6e103e26f6f9daa6bbd653ced454))
* **deps:** bump redis-extension from 1.2.2 to 1.2.3 ([#793](https://github.com/PHT-Medic/central/issues/793)) ([b174de7](https://github.com/PHT-Medic/central/commit/b174de790ba977921df37ab4f454f93f7766abc6))
* **deps:** bump routup dependencies ([f3acd01](https://github.com/PHT-Medic/central/commit/f3acd018dd357a395020ac764fdbf4cd301936fb))
* **deps:** bump typeorm-extension from 2.4.1 to 2.4.2 ([#737](https://github.com/PHT-Medic/central/issues/737)) ([2b5cb7f](https://github.com/PHT-Medic/central/commit/2b5cb7fdc5866e3445c62a7d61a0fa8f7b28bb65))
* **deps:** bump typeorm-extension from 2.4.2 to 2.5.0 ([#811](https://github.com/PHT-Medic/central/issues/811)) ([fff271f](https://github.com/PHT-Medic/central/commit/fff271f412dffd68c801c57b6e25d78b65f4bf6b))
* **deps:** bump typeorm-extension from 2.5.0 to 2.5.2 ([#816](https://github.com/PHT-Medic/central/issues/816)) ([e6c709f](https://github.com/PHT-Medic/central/commit/e6c709f7a9facc0528f2f21b697157faefda8ab0))
* **deps:** bump yargs from 17.6.2 to 17.7.0 ([#817](https://github.com/PHT-Medic/central/issues/817)) ([1986592](https://github.com/PHT-Medic/central/commit/19865925416c81f342b792c82273afef1b8b1ca1))
* **deps:** bump yargs from 17.7.0 to 17.7.1 ([#853](https://github.com/PHT-Medic/central/issues/853)) ([88c52dd](https://github.com/PHT-Medic/central/commit/88c52dd6682516bcc015c16bf2cfc1ab3d890b93))
* **deps:** updated authup & routup dependencies ([7c57ef8](https://github.com/PHT-Medic/central/commit/7c57ef893c9ef57143bdaa0820a320f3f9a72189))
* ensure entrypoint file is associated to the right train ([f132509](https://github.com/PHT-Medic/central/commit/f1325097b197c535377049b96bedfe9683955e6e))
* minor cleanup ([fa1fd3d](https://github.com/PHT-Medic/central/commit/fa1fd3dc8da694cc9cf6de382ddc45eb9d70c59a))
* minor package cleanup ([8af5b9b](https://github.com/PHT-Medic/central/commit/8af5b9baced2b431e6da080670428b899adfe004))
* param for reading single train file ([271b817](https://github.com/PHT-Medic/central/commit/271b817c071f76e6e859c4616baff690d80deb6c))
* permission list view ([cc8a412](https://github.com/PHT-Medic/central/commit/cc8a412edbda67ec72494e80fa859770641c90d5))
* prefix built-in modules to avoid intererence ([0b23880](https://github.com/PHT-Medic/central/commit/0b23880fc249ce220682e14c79b4894121dd95a0))
* prevent sending upload response in chunks + train-file tests ([d9bd7e6](https://github.com/PHT-Medic/central/commit/d9bd7e6a3cbfe6428c220f31efedbdef05e8db40))
* query realm restriction ([37f85f5](https://github.com/PHT-Medic/central/commit/37f85f51375c4ba0a4058055b1bea739e80ec80e))
* registry payload build context usage ([a35b461](https://github.com/PHT-Medic/central/commit/a35b461d4470c786f99df33fa83c3e3850adc003))
* removed unneccessary rate-limit & prometheus definition ([7a0359b](https://github.com/PHT-Medic/central/commit/7a0359b9e31b2694b1c4de99eb0019ce8cda2af1))
* reverted axios version to 1.2.2 ([6625878](https://github.com/PHT-Medic/central/commit/66258785ec2dce3123383e98ebe71dd36eff2602))
* train container packing ([7e9063c](https://github.com/PHT-Medic/central/commit/7e9063c8823e1a83cd4dc5cbc61a40cf8f75367b))
* train router aggregation ([6a79a1b](https://github.com/PHT-Medic/central/commit/6a79a1bd7e31f11e5f14d601c475febce46d9056))
* **ui:** fix typings + reset lock file ([499baa9](https://github.com/PHT-Medic/central/commit/499baa93f603f673182daf7fd529753f0fb25771))
* updated payload building ([f784f27](https://github.com/PHT-Medic/central/commit/f784f27176e107c9bacca44eca27b86a798c5321))
* updated swagger-generation due new file loading ([aebb3bd](https://github.com/PHT-Medic/central/commit/aebb3bdfda0db6347236b485e66f2c2481e1a0d4))


### Features

* adjusted preset role permissions ([ea73e26](https://github.com/PHT-Medic/central/commit/ea73e26c16c70be226a3b089474c35063070652f))
* adjusted station registry for new realm schema ([554354f](https://github.com/PHT-Medic/central/commit/554354f60754cd251bcbda867b86e603582e2a83))
* **api:** applied new queue schema ([f64385e](https://github.com/PHT-Medic/central/commit/f64385e06ec40e27484f4f326c7a0ff3e2c61372))
* **api:** refactored env building & accessing ([adc65ac](https://github.com/PHT-Medic/central/commit/adc65acfdc6a2c9bd1ea3bff0d7f68fc96b8ac32))
* cleanup trainFile api + moved code/methods to corresponding domain ([36f5382](https://github.com/PHT-Medic/central/commit/36f53820a03867dbe52ba6776d8b754389263b74))
* contextualized local api secret-storage & registry components ([fab1553](https://github.com/PHT-Medic/central/commit/fab15536d1558d34548d1f46d8e751a6d0a87422))
* database cache layer with redis ([f032869](https://github.com/PHT-Medic/central/commit/f032869c468a54e8820cdcf40613126d911c94ec))
* dynamic incoming & outgoing external project name ([32514ff](https://github.com/PHT-Medic/central/commit/32514ff810819974b855760ece6b80505dbecdf6))
* enhace structure, stricter typings, clearer ownership ([de360e2](https://github.com/PHT-Medic/central/commit/de360e2ff383054ad31b3ce69bf4756496f359ee))
* fix base path for serving swagger file +Ã oppurtinity for additional information ([3a98a82](https://github.com/PHT-Medic/central/commit/3a98a824d9f224c1497d040cda6b51d77350b154))
* flatten domains structure ([751479c](https://github.com/PHT-Medic/central/commit/751479cbc67cb38dc79bd5fff0306ee278dfabd2))
* migraiton generation for postgres & mysql ([e17961c](https://github.com/PHT-Medic/central/commit/e17961c2f58ad8235e758968f1b83cd15a350da2))
* move setup & destroy train command to train-service ([e592cbe](https://github.com/PHT-Medic/central/commit/e592cbe4481e794303f1f30e8f361ca7d841dbf5))
* pipe train-files to gunzip ([d59bcb2](https://github.com/PHT-Medic/central/commit/d59bcb2796543ad8154a7e1197549766cf6b85c8))
* replaced yup with zod + contextualized build registry payload ([f8fdaa5](https://github.com/PHT-Medic/central/commit/f8fdaa5bb380662eb8ab89f2d8319047ccdb8618))
* simplified and enhanced master-image git syncing ([33cc76e](https://github.com/PHT-Medic/central/commit/33cc76e707f79facaa244f6fe00df85a029d8ebb))
* simplified and enhanced master-image synchronization + test suite ([8b44304](https://github.com/PHT-Medic/central/commit/8b4430441206238ab6e804dccf0c3e075f6c2214))
* started restructuring components & domains ([aa0f1da](https://github.com/PHT-Medic/central/commit/aa0f1da941b48c9560f02db9ef46cd39831fc66f))
* train-{files,query} encryption + additional rsa signing ([d5ca6b0](https://github.com/PHT-Medic/central/commit/d5ca6b0c4322e7804e07e16e7ee4d4be79784ff5))





# [1.4.0](https://github.com/PHT-Medic/central/compare/v1.3.27...v1.4.0) (2023-01-11)


### Bug Fixes

* adjusted script paths + reverted migration file ([f0cdb6e](https://github.com/PHT-Medic/central/commit/f0cdb6eb5976373a514f437d295d4d8c8c605a75))
* **api:** infer realm-id for proposal, station & train by current user ([52b0856](https://github.com/PHT-Medic/central/commit/52b0856c63d1ad9f719ee2554109bffa47cc5adb))
* **api:** run open migration file before creating new one ([5f4f429](https://github.com/PHT-Medic/central/commit/5f4f4293c95a3239a6137a83813394e1e0799f12))
* broken migration file ([83db4c5](https://github.com/PHT-Medic/central/commit/83db4c52941881a32718e0e06a03206352d61643))
* **deps:** bump @authup/server-database from 0.4.0 to 0.6.1 ([1ba1047](https://github.com/PHT-Medic/central/commit/1ba1047c7ea801eb867f72f75128632cac3056a9))
* **deps:** bump @hapic/harbor from 0.3.0 to 1.0.0 ([2005252](https://github.com/PHT-Medic/central/commit/2005252b9352a7bed15d42c73e863b2cf8630aa0))
* **deps:** bump @hapic/vault from 0.3.0 to 1.0.0 ([77a4c78](https://github.com/PHT-Medic/central/commit/77a4c78054a58caa78ffaa973286cd2fac00e528))
* **deps:** bump @routup/cookie from 0.3.1 to 0.3.2 ([0eaadb7](https://github.com/PHT-Medic/central/commit/0eaadb7e562310f89a2c8fa2d1b9eea0251efaad))
* **deps:** bump @routup/cookie from 0.3.2 to 0.4.0 ([2cc50bc](https://github.com/PHT-Medic/central/commit/2cc50bc742635a4d3a62b68c6b53663084e2c972))
* **deps:** bump @routup/decorators from 0.1.9 to 0.1.10 ([063b819](https://github.com/PHT-Medic/central/commit/063b8197dcaedcc721e71869c821f7c3ffb6322b))
* **deps:** bump @routup/swagger from 0.3.2 to 0.4.0 ([ebc84cc](https://github.com/PHT-Medic/central/commit/ebc84ccb15a44c981a5e1b8a744b1286b5832c6f))
* **deps:** bump @routup/swagger from 0.4.0 to 0.4.1 ([033b5ad](https://github.com/PHT-Medic/central/commit/033b5ad64cf0b08397c22435fddfea3503c81ba5))
* **deps:** bump axios from 1.2.1 to 1.2.2 ([b93d97c](https://github.com/PHT-Medic/central/commit/b93d97c17575dbd04986a253db297078535c7db2))
* **deps:** bump hapic from 0.3.0 to 1.0.0 ([656f5a4](https://github.com/PHT-Medic/central/commit/656f5a4880db663c13ecad27f50eb5054e76d950))
* **deps:** bump prom-client from 14.1.0 to 14.1.1 ([74d48bf](https://github.com/PHT-Medic/central/commit/74d48bfca303c20ce5466ec1f98a130de5950fba))
* **deps:** bump rapiq from 0.6.1 to 0.6.2 ([8cffc54](https://github.com/PHT-Medic/central/commit/8cffc54eb2599b2e7c2b8399e0be125a70abb819))
* **deps:** bump rapiq from 0.6.2 to 0.6.3 ([ce5be5e](https://github.com/PHT-Medic/central/commit/ce5be5eadd4e9ac5b6d77d49d8b1a9178e7d78ef))
* **deps:** bump routup from 0.9.0 to 0.9.1 ([8237465](https://github.com/PHT-Medic/central/commit/823746591389a37743f531696b97f134cb9ddc85))
* **deps:** bump typeorm-extension from 2.4.0 to 2.4.1 ([b34a954](https://github.com/PHT-Medic/central/commit/b34a954bda07cd3ba93da22d5607d402ed9dbc44))
* **deps:** updated authup & routup libs + modified code base ([c44a22c](https://github.com/PHT-Medic/central/commit/c44a22c2f3b4ebebb7e0877c5e18697dd04a6ba7))


### Features

* better restriction for rate-limit middleware ([1429aaf](https://github.com/PHT-Medic/central/commit/1429aaf92956bd025c637439b4464e5aee29374c))





## [1.3.27](https://github.com/PHT-Medic/central/compare/v1.3.26...v1.3.27) (2022-10-06)

### Bug Fixes

- **deps:** bump body-parser from 1.20.0 to 1.20.1 ([6cd90c9](https://github.com/PHT-Medic/central/commit/6cd90c91850975ebfcf54ac90e949056122ae974))
- **deps:** bump typeorm-extension from 2.1.11 to 2.1.12 ([ab5468b](https://github.com/PHT-Medic/central/commit/ab5468b1b325fb96a14af71762ff63553d05e373))
- generate documentation on upgrade command ([1db330d](https://github.com/PHT-Medic/central/commit/1db330de435dd636a7263a50a5cff288ca57f2e9))
- swagger documentation generation ([83f6eb0](https://github.com/PHT-Medic/central/commit/83f6eb03780d9f7d1a5d3032048426bcffacea09))
