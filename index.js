"use strict";
var fmt = require('winston-format');
// snapshot and copy over levels at time of creation
function resetLevels(target, levels) {
  target.levels = levels;
  Object.keys(target.levels).forEach(function (level) {
    target[level] = target.log.bind(target, level);
  });
  return target;
};
exports.logEvents = function logEvents(logger, ee, eventNames, options) {
  var $emit = ee.emit;
  if (typeof $emit !== 'function') {
    throw Error('Expected ee to have a .emit function');
  }
  options = options || {};
  var argn = options.argn || 0;
  var level = options.level || null;
  var msg = options.msg || 'event';
  var events = Object.create(null);
  for (var i = 0; i < eventNames.length; i++) {
    events[eventNames[i]] = true;
  }
  ee.emit = function () {
    var event = arguments[0];
    if (event in events) {
      var loglevel = level;
      var meta = {
        event: event
      };
      if (argn !== 0) {
        meta.args = Array.prototype.slice.call(arguments, 1, 1 + argn);
      }
      if (loglevel === null) {
        if (event === 'error' ||
          event === 'warn' ||
          event === 'debug') {
          loglevel = event;
        }
        else {
          loglevel = 'info';
        }
      }
      logger.log(loglevel, msg, {
        event: event,
      });
    }
    return $emit.apply(this, arguments);
  }
  return logger;
}
exports.delegate = function createDelegate(logger, logfn, levels) {
  var child = Object.create(logger);
  function delegate(args) {
    // DO NOT BIND, LOOK IT UP EVERY TIME
    return logger.log.apply(logger, args);
  }
  child.log = function delegateLog() {
    var args = Array.from(arguments);
    var end = args.length - 1;
    if (args.length && typeof args[end] === 'function') {
      end--;
    }
    var meta_index = fmt.indexOfMeta(args, end);
    logfn(args, delegate, meta_index);
  }
  resetLevels(child, levels || child.levels);
  return child;
};
var breadcrumb_id = 1;
exports.breadcrumb = function breadcrumb(logger, msg, key) {
  key = key || 'breadcrumb';
  return exports.delegate(logger, function breadcrumbs(args, delegate, meta_index) {
    if (meta_index === -1) {
      meta_index = args.push(Object.create(null)) - 1;
    }
    args[meta_index][key] = msg;
    delegate(args);
  });
};
// create a logger that is based upon `source` but also logs
// everything to `tap`
exports.createTee = function createTee(source, tap, levels) {
  var child = Object.create(source);
  child.log = function teeLog() {
    source.log.apply(source, arguments);
    tap.log.apply(tap, arguments);
  }
  resetLevels(child, levels || child.levels);
  return child;
}
