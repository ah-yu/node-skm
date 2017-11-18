/*
 * @Author: buji 
 * @Date: 2017-11-18 17:29:05 
 * @Last Modified by: buji
 * @Last Modified time: 2017-11-18 18:08:17
 */
'use strcit'

const path = require('path');

const sshPath = path.resolve(__dirname, '../temp/.ssh');
const skmPath = path.resolve(__dirname, '../temp/.skm')

module.exports = {
    sshPath,
    skmPath
}