var ProxyWrap = require( '../index' ),
	Promise = require( 'findhit-promise' ),
	Util = require( 'findhit-util' ),

	protocols = {
		net: require( 'net' ),
		http: require( 'http' ),
	}

	sinon = require( 'sinon' ),
	chai = require( 'chai' ),
	expect = chai.expect;

module.defaults = {
	testServer: {
		protocol: 'TCP4',
		clientAddress: '10.10.10.1',
		clientPort: 12456,
		proxyAddress: '10.10.10.254',
		proxyPort: 80,
	},
}

module.exports = {

	createServer: function ( p, options ) {
		var pc = protocols[ p ],
			proxy = ProxyWrap.proxy( pc, Util.is.Object( options ) || {} ),

			server = proxy.createServer(),
			port = Math.floor( ( Math.random() * 5000 ) + 15000 ), // To be sure that the port is not beeing used on test side
			host = '127.0.0.1';

		server._protocol = p;
		server._protocolConstructor = pc;
		server.host = host;
		server.port = port;

		// Start server on localhost/random-port
		server.listen( port, host );

		// Returns server
		return server;
	},

	testServer: function ( server, options ) {
		var header, body,
			p = server._protocol,
			pc = server._protocolConstructor;

		// Prepare options
		options = Util.extend( {}, module.defaults.testServer, Util.is.Object( options ) && options || {} );

		// Build header
		header = [
			'PROXY',
			options.protocol,
			options.clientAddress,
			options.proxyAddress,
			options.clientPort,
			options.proxyPort,
		].join(' ') + "\r\n";

		body = [
			"GET /something/cool HTTP/1.1",
			"Host: www.findhit.com"
		].join("\n");

		return new Promise( function ( fulfill, reject ) {
			var client = new protocols.net.Socket(),

				host = server.host,
				port = server.port;

			server.once( 'proxiedConnection', function ( socket ) {
				
				try{

					expect( socket.clientAddress ).to.be.equal( options.clientAddress );
					expect( socket.proxyAddress ).to.be.equal( options.proxyAddress );
					expect( socket.clientPort ).to.be.equal( options.clientPort );
					expect( socket.proxyPort ).to.be.equal( options.proxyPort );

				} catch ( err ) {
					reject( err );
				}

				socket.end();
			});

			client.once( 'connect', function () {
				// Send header and body
				client.write( header + body );
			});

			client.once( 'end', function () {
				fulfill();
			});

			client.connect( port, host );

		});
	}

};