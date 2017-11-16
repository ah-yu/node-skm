/*
 * @Author: buji 
 * @Date: 2017-11-16 09:13:07 
 * @Last Modified by: buji
 * @Last Modified time: 2017-11-16 16:13:29
 */
'use strict'

const path = require('path');
const fs = require('fs');
const os = require('os');
const config = require('../config');

const homedir = os.homedir();
const sshPath = path.join(homedir, config.sshPath);
const skmPath = path.join(homedir, config.skmPath);

module.exports = {
    sshPath,
    skmPath
}