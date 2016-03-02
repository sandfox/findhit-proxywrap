# Proxywrap

THIS WAS A SHORT TERM BUG FIX FORK OF FINDHIT'S REPO. THIS IS NO LONGER MAINTAINED AND THE BUG FIXES IN THIS REPO WERE COMBINED INTO THE [FINDHIT ONE](https://github.com/findhit/proxywrap)

This module is a fork of original [proxywrap](https://github.com/daguej/node-proxywrap) by [Josh Dague](https://github.com/daguej). Unfortunately, the project doesn't have recent changes. As so, we decided to contribute to it by forking it and make it better. Do you have any idea to improve this? Feel free to open an **Issue** or **Pull Request**.

This module wraps node's various `Server` interfaces so that they are compatible with the [PROXY protocol](http://haproxy.1wt.eu/download/1.5/doc/proxy-protocol.txt).  It automatically parses the PROXY headers and resets `socket.remoteAddress` and `socket.remotePort` so that they have the correct values.

```

    npm install findhit-proxywrap

```

This module is especially useful if you need to get the client IP address when you're behind an AWS ELB in TCP mode.

In HTTP or HTTPS mode (aka SSL termination at ELB), the ELB inserts `X-Forwarded-For` headers for you.  However, in TCP mode, the ELB can't understand the underlying protocol, so you lose the client's IP address.  With the PROXY protocol and this module, you're able to retain the client IP address with any protocol.

In order for this module to work, you must [enable the PROXY protocol on your ELB](http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide/enable-proxy-protocol.html) (or whatever proxy your app is behind).

Usage
-----

proxywrap is a drop-in replacement.  Here's a simple Express app:

```

    var http = require('http')
        , proxiedHttp = require('findhit-proxywrap').proxy( http )
        , express = require('express')
        , app = express()
        , srv = proxiedHttp.createServer(app); // instead of http.createServer(app)

    app.get('/', function(req, res) {
        res.send('IP = ' + req.connection.remoteAddress + ':' + req.connection.remotePort);
    });

    srv.listen(80);

```

The magic happens in the `proxywrap.proxy()` call.  It wraps the module's `Server` constructor and handles a bunch of messy details for you.

You can do the same with `net` (raw TCP streams), `https`, and `spdy`.  It will probably work with other modules that follow the same pattern, but none have been tested.

*Note*: If you're wrapping [node-spdy](https://github.com/indutny/node-spdy), its exports are a little strange:

    var proxiedSpdy = require('proxywrap').proxy(require('spdy').server);

This also adds to all your sockets the properties:
* `socket.clientAddress` - The IP Address that connected to your PROXY.
* `socket.clientPort` - The Port used by who connected to your PROXY.
* `socket.proxyAddress` - The IP Address exposed on Client <-> Proxy side.
* `socket.proxyPort` - The Port exposed on Client <-> Proxy side. Usefull for detecting SSL on AWS ELB.
* `socket.remoteAddress` [optional] - Same as `socket.clientAddress`, used for compability proposes.
* `socket.remotePort` [optional] - Same as `socket.clientPort`, used for compability proposes.

**Warning:** By default, *all* traffic to your proxied server MUST use the PROXY protocol.  If the first five bytes received aren't `PROXY`, the connection will be dropped.  Obviously, the node server accepting PROXY connections should not be exposed directly to the internet; only the proxy (whether ELB, HAProxy, or something else) should be able to connect to node.

API
---

### `proxy(Server[, options])`

Wraps something that inherits from the `net` module, exposing a `Server` and `createServer`.  Returns the same module patched to support the PROXY protocol.

Options:

- `strict` (default `true`): Incoming connections MUST use the PROXY protocol.  If the first five bytes received aren't `PROXY`, the connection will be dropped.  Disabling this option will allow connections that don't use the PROXY protocol (so long as the first bytes sent aren't `PROXY`).  Disabling this option poses a security risk; it should be enabled in production.

- `overrideRemote` (default `true`): **findhit-proxywrap** overrides `socket.remoteAddress` and `socket.remotePort` for compability proposes. If you set this as `false`, your `socket.remoteAddress` and `socket.remotePort` will have the Address and Port of your **load-balancer** or whatever you are using behind your app. You can also access client's Address and Port by using `socket.clientAddress` and `socket.clientPort`.


Thanks
------

Huge thanks to [Josh Dague](https://github.com/daguej) for creating original [proxywrap](https://github.com/daguej/node-proxywrap).
