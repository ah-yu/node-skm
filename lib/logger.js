/*
 * @Author: buji 
 * @Date: 2017-11-18 11:56:04 
 * @Last Modified by: buji
 * @Last Modified time: 2017-11-18 11:57:45
 */
'use strict'

const chalk = require('chalk');

module.exports = {
    info(message) {
        console.log(message);
    },
    error(message) {
        chalk.red(message);
    }
}