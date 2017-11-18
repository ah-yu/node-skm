/*
 * @Author: buji 
 * @Date: 2017-11-12 20:46:10 
 * @Last Modified by: buji
 * @Last Modified time: 2017-11-18 17:02:12
 */
'use strict'

const fs = require('fs');
const path = require('path');
const util = require('util');
const constant = require('./constant');
const shell = require('shelljs');
const chalk = require('chalk');
const rimraf = require('rimraf');

class Common {
    /**
     * 
     * @param {object} config
     * @param {string} config.sshPath
     * @param {string} config.skmPath 
     */
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }

    /**
     * init skm store
     * 
     * @returns 
     * @memberof Common
     */
    async init() {
        const {
            sshPath,
            skmPath
        } = this.config

        const logger = this.logger;

        const isSkmExsit = fs.existsSync(skmPath);
        if (!isSkmExsit) {
            fs.mkdirSync(skmPath);
        } else {
            logger.error('skm store is already exist');
            return;
        }

        const sshPrivateKeyPath = path.join(sshPath, constant.privateKey);
        const sshPublicKeyPath = path.join(sshPath, constant.publicKey);
        const isSshKeyExsit = fs.existsSync(sshPrivateKeyPath);

        if (isSshKeyExsit) {
            const skmDefaultPath = path.join(skmPath, constant.default);
            const rename = util.promisify(fs.rename);

            fs.mkdirSync(skmDefaultPath);

            await Promise.all([
                rename(sshPrivateKeyPath, path.join(skmDefaultPath, constant.privateKey)),
                rename(sshPublicKeyPath, path.join(skmDefaultPath, constant.publicKey))
            ]);
        }
        this._createLink(constant.default);
    }

    listKeys() {
        const sshKeyMap = this._loadSSHKeys();
        const logger = this.logger;
        sshKeyMap.forEach((value, key) => {
            if (value.inuse) {
                logger.info(chalk.green(`->\t${key}`))
            } else {
                logger.info(`\t${key}`);
            }
        })
    }

    async useKey(alias) {
        const logger = this.logger;
        try {
            await this._createLink(alias);
            logger.info(`now using SSH key: ${alias}`);
        } catch (error) {
            logger.error(chalk.red('use ssh key failed, please try again'));
        }
    }

    deleteKey(alias) {
        const {
            skmPath
        } = this.config;

        const logger = this.logger;

        const sshKeyMap = this._loadSSHKeys();
        const entry = sshKeyMap.get(alias);
        if (!entry) {
            logger.error(chalk.red(`no such SSH key: ${alias}`));
            process.exit(1);
        }

        if (entry.inuse) {
            this._clearKey();
        }

        rimraf(path.join(skmPath, alias), (error) => {
            if (error) throw error;
            logger.info(`delete ${alias} ssh key successfully`);
        });


    }

    async renameKey(oldAlias, newAlias) {
        const {
            sshPath,
            skmPath
        } = this.config;

        const logger = this.logger;

        const sshKeyMap = this._loadSSHKeys();
        const entry = sshKeyMap.get(oldAlias);
        if (!entry) {
            logger.error(chalk.red(`no such SSH key: ${oldAlias}`));
            process.exit(0);
        }

        const rename = util.promisify(fs.rename);
        await rename(path.join(skmPath, oldAlias), path.join(skmPath, newAlias));
        if (entry.inuse) {
            this._createLink(newAlias);
        }
    }


    createKey(alias, comment) {
        const {
            sshPath,
            skmPath
        } = this.config;

        const logger = this.logger;

        const sshKeyMap = this._loadSSHKeys();
        if (sshKeyMap.get(alias)) {
            logger.error(chalk.red(`${alias} ssh key is already exsit`));
            return;
        }

        fs.mkdirSync(path.join(skmPath, alias));

        shell.exec(`ssh-keygen -f ${path.join(skmPath,alias,constant.privateKey)} -C "${comment}"`);
        logger.info(`create ${alias} ssh key successfully!`);
    }

    _clearKey() {
        const {
            sshPath
        } = this.config;

        const privateKeyPath = path.join(sshPath, constant.privateKey);
        const publicKeyPath = path.join(sshPath, constant.publicKey);

        if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
            const unlink = util.promisify(fs.unlink);
            const promises = [unlink(privateKeyPath), unlink(publicKeyPath)]
            return Promise.all(promises);
        }

        return Promise.reject(new Error('dont exsit private ssh key or public ssh key'));

    }

    async _createLink(alias) {
        const {
            sshPath,
            skmPath
        } = this.config;

        try {
            await this._clearKey();
        } catch (error) {
            console.log('clear keys failed!');
            console.log(error);
            process.exit(0);
        }

        const symlink = util.promisify(fs.symlink);
        const promises = [
            symlink(path.join(skmPath, alias, constant.privateKey), path.join(sshPath, constant.privateKey)),
            symlink(path.join(skmPath, alias, constant.publicKey), path.join(sshPath, constant.publicKey))
        ];

        return Promise.all(promises);
    }

    _loadSSHKeys() {
        const {
            skmPath,
            sshPath
        } = this.config;

        const sshPrivateKeyPath = path.join(sshPath, constant.privateKey);
        let sshPrivateKeyLinked;
        if (fs.lstatSync(sshPrivateKeyPath).isSymbolicLink) {
            sshPrivateKeyLinked = fs.readlinkSync(sshPrivateKeyPath);
        }

        const sshKeyMap = new Map();

        const skmFiles = fs.readdirSync(skmPath);

        skmFiles.forEach((skmFile) => {
            const isDir = fs.statSync(path.join(skmPath, skmFile)).isDirectory;
            const privateKeyPath = path.join(skmPath, skmFile, constant.privateKey);
            const publicKeyPath = path.join(skmPath, skmFile, constant.publicKey);
            const privateKeyExsit = fs.existsSync(privateKeyPath);
            const publicKeyExsit = fs.existsSync(publicKeyPath);
            if (privateKeyExsit && publicKeyExsit) {
                const inuse = privateKeyPath === sshPrivateKeyLinked;
                sshKeyMap.set(skmFile, {
                    privateKey: privateKeyPath,
                    publicKey: publicKeyPath,
                    inuse: inuse
                })
            }
        });

        return sshKeyMap;
    }
}

module.exports = Common;