'use strict';
const config = require('../config')
const KadoUI = require('kado-ui')
if(require.main === module){
  KadoUI.master(config,config.main,__dirname + '/worker')
}
