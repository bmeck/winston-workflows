# Winston Workflows

```js
var workflows = require('winston-workflows');
var logger = require('winston');

var id = 0;
require('http').createServer(function (req,res) {
  // add request id to metadata array key "breadcrumbs"
  var logger = workflow.breadcrumb(winston, `request=${id++}`);
    // log any 'error', 'end' events req encounters
    // does not swallow 'error' events
    //
    // 'debug', 'error', 'warn' events are given those levels
    // *ALL* others are 'info'
    //
    workflow.logEvents(logger, req, ['error', 'end']);
    workflow.logEvents(logger, res, ['error']);
    logger.info('http', {
      method: req.method,
      url: req.url
    });
    res.end();
}).listen(process.env.PORT || 8080);
```

```js
// used for branching/async operations
// knowing the context of what got you there
workflows.breadcrumb(logger, value, key='breadcrumbs');

// used to log events without clobbering `error` handling
workflows.logEvents(logger, req, [...events]);

// used to transform everything winston sees
workflows.delegate(logger, transform(args, passthrough_callback(new_args)));
```
