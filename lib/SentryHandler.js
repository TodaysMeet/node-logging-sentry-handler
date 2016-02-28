'use strict';

var childProcess = require('child_process');
var util = require('util');
var raven = require('raven');
var Handler = require('@todaysmeet/logging').Handler;


var RELEASE;
try {
    RELEASE = childProcess.execSync('git rev-parse HEAD', {encoding: 'utf-8'}).trim();
} catch (e) {
    console.error((new Date).toISOString(), e);
}


function getCulprit (record) {
    if (!record.pathname) {
        return record.func || '';
    }
    var path = record.pathname.split('/');
    var module = path[path.length - 1].split('.').slice(0, -1).join('.');
    return util.format('%s in %s', module, record.func);
}


function SentryHandler(level, dsn) {
    this.client = new raven.Client(dsn, {release: RELEASE});
    Handler.call(this, level);
}

util.inherits(SentryHandler, Handler);

SentryHandler.prototype.emit = function SentryHandler_emit(record) {
    var level = record.levelName.toLowerCase();
    if (level == 'warn') {
        level = 'warning';
    }
    var kwargs = {
        level: level,
        extra: {
            process: record.process,
            processName: record.processName,
            asctime: record.created.toISOString(),
            'process.argv': process.argv,
            pathname: record.pathname,
            lineno: record.lineno
        },
        'sentry.interfaces.Message': {
            message: record.msg,
            params: record.args
        }
    };

    if (record.exc) {
        this.client.captureError(record.exc, kwargs);
    } else {
        kwargs.culprit = getCulprit(record);
        this.client.captureMessage(record.getMessage(), kwargs);
    }
};

module.exports = SentryHandler;
