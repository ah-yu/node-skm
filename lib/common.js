/*
 * @Author: buji 
 * @Date: 2017-11-12 20:46:10 
 * @Last Modified by: buji
 * @Last Modified time: 2017-11-16 17:13:12
 */
'use strict'

const fs = require('fs');
const path = require('path');
const util = require('util');
const constant = require('./constant');

class Common {
    constructor(config) {
        this.config = config;
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

        const isSkmExsit = fs.existsSync(skmPath);
        if (!isSkmExsit) {
            fs.mkdirSync(skmPath);
        } else {
            console.log('skm store is already exist');
            return;
        }

        const sshPrivateKeyPath = path.join(sshPath, constant.privateKey);
        const sshPublicKeyPath = path.join(sshPath, constant.publicKey);
        const isSshKeyExsit = fs.existsSync(sshPrivateKeyPath);

        if (isSshKeyExsit) {
            const skmDefaultPath = path.join(skmPath, constant.default);
            const rename = util.promisify(fs.rename);
            await util.promisify(fs.mkdir)(skmDefaultPath);
            await Promise.all([
                rename(sshPrivateKeyPath, path.join(skmDefaultPath, constant.privateKey)),
                rename(sshPublicKeyPath, path.join(skmDefaultPath, constant.publicKey))
            ]);
        }
        await this._createLink(constant.default);
    }

    async listKeys() {
        const sshKeyMap = await this._loadSSHKeys();
        sshKeyMap.forEach((value, key) => {
            if (value.inuse) {
                console.log(`->\t${key}`)
            } else {
                console.log(`\t${key}`)
            }
        })
    }

    async useKey(alias) {
        try {
            await this._createLink(alias);
            console.log(`now using SSH key: ${alias}`)
        } catch (error) {
            console.log('use ssh key failed, please try again');
        }
    }

    async deleteKey(alias) {
        const {
            skmPath
        } = this.config;

        const sshKeyMap = await this._loadSSHKeys();
        const entry = sshKeyMap.get(alias);
        if (!entry) {
            console.log(`no the SSH key: ${alias}`);
            process.exit(1);
        }

        if (entry.inuse) {
            await this._clearKey();
        }

        const unlink = util.promisify(fs.unlink);
        unlink(path.join(skmPath, alias));
    }

    // renameKey(oldAlias, newAlias) {
    //     const {
    //         sshPath,
    //         skmPath
    //     } = this.config;
    //     const sshKeyMap = await this._loadSSHKeys();
    //     const entry = sshKeyMap.get(oldAlias);
    //     if (!entry) {
    //         console.log(`no the SSH key: ${oldAlias}`);
    //         process.exit(0);
    //     }

    //     const rename = util.promisify(fs.rename);
    //     await rename(path.join(skmPath, oldAlias), path.join(skmPath, newAlias));
    //     this._createLink(newAlias);
    // }

    backupKeys() {

    }

    restoreKeys() {

    }

    createKey() {

    }

    async _clearKey() {
        const {
            sshPath
        } = this.config;

        const privateKeyPath = path.join(sshPath, constant.privateKey);
        const publicKeyPath = path.join(sshPath, constant.publicKey);

        if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
            const unlink = util.promisify(fs.unlink);
            const promises = [unlink(privateKeyPath), unlink(publicKeyPath)]
            await Promise.all(promises);
        }
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
            process.exit(0);
        }

        const symlink = util.promisify(fs.symlink);
        const promises = [
            symlink(path.join(skmPath, alias, constant.privateKey), path.join(sshPath, constant.privateKey)),
            symlink(path.join(skmPath, alias, constant.publicKey), path.join(sshPath, constant.publicKey))
        ];

        await Promise.all(promises);
    }

    async _loadSSHKeys() {
        const {
            skmPath,
            sshPath
        } = this.config;

        const sshPrivateKeyPath = path.join(sshPath, constant.privateKey);
        let sshPrivateKeyLinked;
        if (fs.lstatSync(sshPrivateKeyPath).isSymbolicLink) {
            sshPrivateKeyLinked = fs.readlinkSync(sshPrivateKeyPath);
        }

        const readdir = util.promisify(fs.readdir);
        const sshKeyMap = new Map();
        let skmFiles;
        try {
            skmFiles = await readdir(skmPath);
        } catch (error) {
            console.log('read directory failed!')
        }

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