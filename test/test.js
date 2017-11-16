'use strict'

const Common = require('../lib/common');
const config = require('../lib/config');
const common = new Common(config);

common.listKeys();