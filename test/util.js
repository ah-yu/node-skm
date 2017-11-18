/*
 * @Author: buji 
 * @Date: 2017-11-18 18:00:39 
 * @Last Modified by: buji
 * @Last Modified time: 2017-11-18 21:42:14
 */
'use strict'

const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');
const shell = require('shelljs');

const tempDirPath = path.join(__dirname, 'temp');

function refreshTmpDir() {
    rimraf.sync(tempDirPath);
    fs.mkdirSync(tempDirPath);
}

function removeTmpDir() {
    rimraf.sync(tempDirPath);
}

function mkdirTempDir() {
    fs.mkdirSync(tempDirPath);
}

//generate ssh keys in skm store and use alpha key
//alias: alpha dev
//use: alpha
function generateSSHKeysCase(config) {
    fs.mkdirSync(config.skmPath);
    fs.mkdirSync(config.sshPath);
    fs.mkdirSync(path.join(config.skmPath, 'dev'));
    fs.mkdirSync(path.join(config.skmPath, 'alpha'));


    const alphaPriKeyPath = path.join(config.skmPath, 'alpha', 'id_rsa');
    const alphaPubKeyPath = path.join(config.skmPath, 'alpha', 'id_rsa.pub');

    shell.exec(`ssh-keygen -f ${path.join(config.skmPath,'dev','id_rsa')} -C "" -N "" -q`);
    shell.exec(`ssh-keygen -f ${alphaPriKeyPath} -C "" -N "" -q`);

    fs.symlinkSync(alphaPriKeyPath, path.join(config.sshPath, 'id_rsa'));
    fs.symlinkSync(alphaPubKeyPath, path.join(config.sshPath, 'id_rsa.pub'));
}

module.exports = {
    refreshTmpDir,
    removeTmpDir,
    mkdirTempDir,
    generateSSHKeysCase
}