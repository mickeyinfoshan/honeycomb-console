'use strict';
/**
 * app的主入口文件
 */
const App = require('hc-bee');
const app = new App();
const config = require('./config');
const promisify = require('utils').promisify;
const utils = require('./common/utils');
const callremote = utils.callremote;

app.server.setTimeout(300000);

config.username = app.config.username;
config.password = app.config.password;

const cluster = require('./model/cluster');
const db = require('./common/db');

if (db.ready) {
  db.ready(() => {
    cluster.getClusterCfg(() => {
      app.ready(true);
    });
  });
} else {
  cluster.getClusterCfg(() => {
    app.ready(true);
  });
}

async function checkCluster() {
  let getSnapshortsSync = promisify(cluster.getSnapshorts);
  let getClusterInfoSync = promisify(getClusterInfo);
  let sss = await getSnapshorts();
  for (let i = 0; i < sss.length; i++) {
    let ss = sss[i];
    let clusterCode = ss.clusterCode;
    let clusterInfoNow = await getClusterInfoSync(clusterCode);
    // TODO check app lists;
    let diff = false;

    if (diff) {

    }
  }
}

function getClusterInfo(clusterCode, cb) {
  let path = '/api/apps';
  let opt = cluster.getClusterCfgByCode(clusterCode);
  callremote(path, opt, function (err, result) {
    if (err || result.code !== 'SUCCESS') {
      let errMsg = err && err.message || result.message;
      log.error('get apps from servers failed: ', errMsg);
      return cb(err);
    } else {
      let ips = [];
      let apps = [];
      result.data.success.forEach((item) => {
        ips.push(item.ip);
        apps = apps.concat(item.apps);
      });
      apps = utils.mergeAppInfo(ips, apps);
      cb(null, apps);
    }
  });
}

function repairCluster(clusterCode, cb) {

}

module.exports = app;
