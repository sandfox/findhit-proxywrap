var ProxyWrap = require('../index'),
	http = require('http'),
	phttp = ProxyWrap.proxy( http, { strict: true }),

	sinon = require('sinon'),
	chai = require('chai'),
	expect = chai.expect;

var server = phttp.createServer(),
	port = Math.floor((Math.random() * 10000) + 10000);

server.listen( port, '0.0.0.0' );

describe("PROXY Protocol v1", function () {

	

});