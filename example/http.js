var workflow = require('../');
var winston = require('winston');
var id = 0;
var domain = require('domain');

  require('http').createServer((req,res)=> {
    var d = domain.create();
    d.logger = workflow.breadcrumb(winston, `request=${id++}`);;
    Object.freeze(d._events);
    d.run(() => {
      var logger = process.domain.logger;
      workflow.logEvents(logger, req, ['error', 'end']);
      workflow.logEvents(logger, res, ['error', 'end']);
      logger.info('http', {
        method: req.method,
        url: req.url
      });
      res.end();
    });
  }).listen(process.env.PORT || 8080);