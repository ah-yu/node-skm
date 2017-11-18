/*
 * @Author: buji 
 * @Date: 2017-11-18 17:15:49 
 * @Last Modified by: buji
 * @Last Modified time: 2017-11-18 17:16:15
 */
'use strict';

class TestLogger {
    constructor() {
        this.logs = {
            info: [],
            error: []
        };
    }

    isEmpty() {
        for (const key of Object.keys(this.logs)) {
            if (this.logs[key].length !== 0) {
                return false;
            }
        }
        return true;
    }

    clear() {
        this.logs.info = [];
        this.logs.error = [];
    }

    info(...args) {
        this.logs.info.push(args);
    }

    error(...args) {
        this.logs.error.push(args);
    }
};

module.exports = TestLogger;