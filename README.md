# SentryHandler for Logging

A Handler that sends log messages to Sentry, and will try to collect
other interesting information to include.


```js
const SentryHandler = require('@todaysmeet/logging-sentry-handler');
const logging = require('@todaysmeet/logging');

let sentry = new SentryHandler(logging.WARNING, process.env.SENTRY_DSN);
logging.getLogger().addHandler(sentry);
```
