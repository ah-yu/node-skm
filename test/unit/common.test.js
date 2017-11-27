/*
 * @Author: buji 
 * @Date: 2017-11-18 17:17:00 
 * @Last Modified by: buji
 * @Last Modified time: 2017-11-27 09:38:31
 */
'use strict'

const assert = require('assert');
const path = require('path');
const shell = require('shelljs');
const config = require('../fixtures/test_config');
const TestLogger = require('../fixtures/test_logger');
const Common = require('../../lib/common');
const testUtil = require('../util');
const fs = require('fs');
const chalk = require('chalk');

describe('check common', () => {
    beforeEach(() => {
        testUtil.refreshTmpDir();
    });

    afterEach(() => {
        testUtil.removeTmpDir();
    });

    describe('check init', () => {
        it('should init skm store successfully', async() => {
            fs.mkdirSync(config.sshPath);
            shell.exec(`ssh-keygen -f ${path.join(config.sshPath,'id_rsa')} -C "" -N "" -q`);

            const logger = new TestLogger();
            const expectedLogs = {
                info: [
                    ['init skm store successfully!']
                ],
                error: []
            }
            const common = new Common(config, logger);
            await common.init();

            const skmPubKeyPath = path.join(config.skmPath, 'default', 'id_rsa.pub');
            const skmPriKeyPath = path.join(config.skmPath, 'default', 'id_rsa');
            const sshPubKeyPath = path.join(config.sshPath, 'id_rsa.pub');
            const sshPriKeyPath = path.join(config.sshPath, 'id_rsa');
            assert(fs.existsSync(skmPriKeyPath));
            assert(fs.existsSync(skmPubKeyPath));
            assert(fs.realpathSync(sshPubKeyPath) === skmPubKeyPath);
            assert(fs.readlinkSync(sshPriKeyPath) === skmPriKeyPath);

            assert.deepStrictEqual(logger.logs, expectedLogs);

        });

        it('should warn skm store exsit', async() => {
            fs.mkdirSync(config.skmPath);

            const logger = new TestLogger();
            const expectedLogs = {
                info: [],
                error: [
                    ['skm store is already exist']
                ]
            }

            const common = new Common(config, logger);
            await common.init();

            assert.deepStrictEqual(logger.logs, expectedLogs);
        })

    });

    describe('check list', () => {
        it('list ssh keys in skm store successfully!', () => {
            testUtil.generateSSHKeysCase(config);

            const logger = new TestLogger();
            const expectedLogs = {
                info: [
                    [`${chalk.green('->\talpha')}`],
                    ['\tdev']
                ],
                error: []
            }
            const common = new Common(config, logger);
            common.listKeys();

            assert.deepStrictEqual(logger.logs, expectedLogs);
        });
    });

    describe('check use', () => {
        it('should log which ssh key is used correctly', async() => {
            testUtil.generateSSHKeysCase(config);

            const logger = new TestLogger();
            const expectedLogs = {
                info: [
                    ['now using SSH key: dev']
                ],
                error: []
            }

            const common = new Common(config, logger);
            await common.useKey('dev');

            const sshPriKeyLink = fs.readlinkSync(path.join(config.sshPath, 'id_rsa'));
            const sshPubKeyLink = fs.readlinkSync(path.join(config.sshPath, 'id_rsa.pub'));
            const devPriKeyPath = path.join(config.skmPath, 'dev', 'id_rsa');
            const devPubKeyPath = path.join(config.skmPath, 'dev', 'id_rsa.pub');

            assert(sshPriKeyLink === devPriKeyPath);
            assert(sshPubKeyLink === devPubKeyPath);
            assert.deepStrictEqual(logger.logs, expectedLogs);
        });
    });

    describe('check delete', () => {
        it('should delete ssh key that not in use successfully', () => {
            testUtil.generateSSHKeysCase(config);

            const logger = new TestLogger();
            const expectedLogs = {
                info: [
                    ['delete dev ssh key successfully']
                ],
                error: []
            };

            const common = new Common(config, logger);
            common.deleteKey('dev');

            assert(!fs.existsSync(path.join(config.skmPath, 'dev')));
            assert.deepStrictEqual(logger.logs, expectedLogs);
        });

        it('should delete ssh key that in use successfully', () => {
            testUtil.generateSSHKeysCase(config);

            const logger = new TestLogger();
            const expectedLogs = {
                info: [
                    ['delete alpha ssh key successfully']
                ],
                error: []
            };

            const common = new Common(config, logger);
            common.deleteKey('alpha');

            assert(!fs.existsSync(path.join(config.skmPath, 'alpha')));
            assert(!fs.existsSync(path.join(config.sshPath, 'id_rsa')));
            assert(!fs.existsSync(path.join(config.sshPath, 'id_rsa.pub')));
            assert.deepStrictEqual(logger.logs, expectedLogs);
        });
    });

    describe('check create', () => {
        it('should create ssh key in skm store successfully', () => {
            testUtil.generateSSHKeysCase(config);

            const logger = new TestLogger();
            const expectedLogs = {
                info: [
                    ['create beta ssh key successfully!']
                ],
                error: []
            };

            const common = new Common(config, logger);
            common.createKey('beta', 'aa@bb.com');

            assert(fs.existsSync(path.join(config.skmPath, 'beta')));
            assert.deepStrictEqual(logger.logs, expectedLogs);
        });

        it('should warn already exsit ssh key use the same alias', () => {
            testUtil.generateSSHKeysCase(config);

            const logger = new TestLogger();
            const expectedLogs = {
                info: [],
                error: [
                    ['dev ssh key is already exsit']
                ]
            };

            const common = new Common(config, logger);
            common.createKey('dev', 'aa@bb.com');

            assert.deepStrictEqual(logger.logs, expectedLogs);
        });
    });

    describe('check rename', () => {
        it('should rename alias successfully', async() => {
            testUtil.generateSSHKeysCase(config);

            const logger = new TestLogger();
            const expectedLogs = {
                info: [
                    ['rename dev to beta successfully']
                ],
                error: []
            }

            const common = new Common(config, logger);
            await common.renameKey('dev', 'beta');

            assert(fs.existsSync(path.join(config.skmPath, 'beta')));
            assert(!fs.existsSync(path.join(config.skmPath, 'dev')));
            assert.deepStrictEqual(logger.logs, expectedLogs);
        });

        it('should warn no such ssh key when rename', async() => {
            testUtil.generateSSHKeysCase(config);

            const logger = new TestLogger();
            const expectedLogs = {
                info: [],
                error: [
                    ['no such SSH key: dev-dev']
                ]
            }

            const common = new Common(config, logger);

            await common.renameKey('dev-dev', 'beta');

            assert.deepStrictEqual(logger.logs, expectedLogs);
        });
    });

    describe('check backup', () => {
        it('should backup ssh keys success', async() => {
            testUtil.generateSSHKeysCase(config);

            const logger = new TestLogger();
            const common = new Common(config, logger);

            await common.backupKeys();

            // TO DO: iso format test
            const backupFileNameRegExp = /^skm-.*\.zip/;

            const files = fs.readdirSync(path.resolve(config.skmPath, '../'));
            let backupFileName;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (backupFileNameRegExp.test(file)) {
                    backupFileName = file;
                    break;
                }
            }

            assert(backupFileName !== undefined);
            const backupFilePath = path.resolve(config.skmPath, `../${backupFileName}`);
            const backupFileSize = fs.statSync(backupFilePath).size;
            const expectedLogs = {
                info: [
                    [`backup in ${backupFilePath}`],
                    ['back up keys successfully!']
                ],
                error: []
            };

            assert.deepStrictEqual(logger.logs, expectedLogs);
        })
    })
})