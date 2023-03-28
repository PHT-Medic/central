# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/PHT-Medic/central/compare/v2.0.0...v2.1.0) (2023-03-28)


### Bug Fixes

* **deps:** bump authup + reduced explicit dependencies ([7b7021f](https://github.com/PHT-Medic/central/commit/7b7021f86b12fa2ae15e6384fd050fe76a5cf49f))
* replace beader with basic authorization header for testing ([af320df](https://github.com/PHT-Medic/central/commit/af320df098c995848fe1a09ee9953dcd50c85995))


### Features

* split api package ([#900](https://github.com/PHT-Medic/central/issues/900)) ([6be0436](https://github.com/PHT-Medic/central/commit/6be04364ccefe46ac579f29b1839a00598a3694c))





# [2.0.0](https://github.com/PHT-Medic/central/compare/v2.0.0-alpha.0...v2.0.0) (2023-03-25)


### Bug Fixes

* **deps:** bump authup to v0.17.2 ([6d500a0](https://github.com/PHT-Medic/central/commit/6d500a0390ecea4e19e107ecb5f476e8b13b8fcf))





# [2.0.0-alpha.0](https://github.com/PHT-Medic/central/compare/v1.4.0...v2.0.0-alpha.0) (2023-03-20)


### Bug Fixes

* api freeze on illegal cache chars + added mjs support for ui ([aa6ef9f](https://github.com/PHT-Medic/central/commit/aa6ef9fd9a78cbe902a6b6618cc144e66659b73f))
* better naming for http/api command enums ([99b71f2](https://github.com/PHT-Medic/central/commit/99b71f287fc4ffe43fcdd6f59cbcba9993f8b0bb))
* change query path location for train build ([33c0ff4](https://github.com/PHT-Medic/central/commit/33c0ff4e6bec36f4287d6ef4b2ed06a6571b5330))
* **deps:** bump @authelion/* dependencies ([cc65e2f](https://github.com/PHT-Medic/central/commit/cc65e2fb443177cf3b093533f4bb864eb9fd3ec2))
* **deps:** bump @authelion/* packages ([5e4bb05](https://github.com/PHT-Medic/central/commit/5e4bb05c87d96fdac348e7089d349b8af35d1d61))
* **deps:** bump authelion ([9a1e07a](https://github.com/PHT-Medic/central/commit/9a1e07a5ac6b0f09d309cb52699f6ed10a4fb8c2))
* **deps:** bump authup & routup dependency ([fccfeb3](https://github.com/PHT-Medic/central/commit/fccfeb3e5d34e9441b0829922f41f177fb5939f8))
* **deps:** bump hapic to v1.2.1 ([aa5db1d](https://github.com/PHT-Medic/central/commit/aa5db1dec946c39cfb889f8fc0dcde5b3764d1c4))
* **deps:** bump hapic to v1.3 and adjusted code base ([1dd9d03](https://github.com/PHT-Medic/central/commit/1dd9d031f5d99fec1282463873643096bbb943ae))
* **deps:** bump rapiq from 0.6.3 to 0.6.4 ([#738](https://github.com/PHT-Medic/central/issues/738)) ([48bcac8](https://github.com/PHT-Medic/central/commit/48bcac84353bb5e2bc266be4510663dcc246c837))
* **deps:** bump rapiq from 0.6.4 to 0.6.6 ([0bcc236](https://github.com/PHT-Medic/central/commit/0bcc2369a0413c54c821ef0ebd86fdb908fca670))
* **deps:** bump rapiq from 0.7.0 to 0.8.0 ([#825](https://github.com/PHT-Medic/central/issues/825)) ([84f4e92](https://github.com/PHT-Medic/central/commit/84f4e923cda1c6c02f32018e20d9815bce6a2d38))
* **deps:** updated authup & routup dependencies ([7c57ef8](https://github.com/PHT-Medic/central/commit/7c57ef893c9ef57143bdaa0820a320f3f9a72189))
* minor package cleanup ([8af5b9b](https://github.com/PHT-Medic/central/commit/8af5b9baced2b431e6da080670428b899adfe004))
* updated payload building ([f784f27](https://github.com/PHT-Medic/central/commit/f784f27176e107c9bacca44eca27b86a798c5321))


### Features

* **api:** applied new queue schema ([f64385e](https://github.com/PHT-Medic/central/commit/f64385e06ec40e27484f4f326c7a0ff3e2c61372))
* cleanup trainFile api + moved code/methods to corresponding domain ([36f5382](https://github.com/PHT-Medic/central/commit/36f53820a03867dbe52ba6776d8b754389263b74))
* **common:** use rollup + swc for bundling cjs & esm output ([5e7db91](https://github.com/PHT-Medic/central/commit/5e7db912999e80c8f70cd5a64d02820f2824e3cb))
* dynamic incoming & outgoing external project name ([32514ff](https://github.com/PHT-Medic/central/commit/32514ff810819974b855760ece6b80505dbecdf6))
* move types ownership to corresponding service ([316d08f](https://github.com/PHT-Medic/central/commit/316d08f68cf89d9780e5fd78795ee756e9643653))
* pipe train-files to gunzip ([d59bcb2](https://github.com/PHT-Medic/central/commit/d59bcb2796543ad8154a7e1197549766cf6b85c8))
* simplified and enhanced master-image git syncing ([33cc76e](https://github.com/PHT-Medic/central/commit/33cc76e707f79facaa244f6fe00df85a029d8ebb))
* train-{files,query} encryption + additional rsa signing ([d5ca6b0](https://github.com/PHT-Medic/central/commit/d5ca6b0c4322e7804e07e16e7ee4d4be79784ff5))





# [1.4.0](https://github.com/PHT-Medic/central/compare/v1.3.27...v1.4.0) (2023-01-11)


### Bug Fixes

* **deps:** bump hapic from 0.3.0 to 1.0.0 ([656f5a4](https://github.com/PHT-Medic/central/commit/656f5a4880db663c13ecad27f50eb5054e76d950))
* **deps:** bump rapiq from 0.6.1 to 0.6.2 ([8cffc54](https://github.com/PHT-Medic/central/commit/8cffc54eb2599b2e7c2b8399e0be125a70abb819))
* **deps:** bump rapiq from 0.6.2 to 0.6.3 ([ce5be5e](https://github.com/PHT-Medic/central/commit/ce5be5eadd4e9ac5b6d77d49d8b1a9178e7d78ef))
* **deps:** updated authup & routup libs + modified code base ([c44a22c](https://github.com/PHT-Medic/central/commit/c44a22c2f3b4ebebb7e0877c5e18697dd04a6ba7))
* http interceptor header on retry request ([bfd0abf](https://github.com/PHT-Medic/central/commit/bfd0abf1f92ba547d11c6afa0cc181cc3e6c19b9))





## [1.3.27](https://github.com/PHT-Medic/central/compare/v1.3.26...v1.3.27) (2022-10-06)

### Bug Fixes

- swagger documentation generation ([83f6eb0](https://github.com/PHT-Medic/central/commit/83f6eb03780d9f7d1a5d3032048426bcffacea09))
