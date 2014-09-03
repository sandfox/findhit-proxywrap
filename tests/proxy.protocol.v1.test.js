var Util = require( 'findhit-util' ),
	tUtil = require( './tests.util' ),

	sinon = require( 'sinon' ),
	chai = require( 'chai' ),
	expect = chai.expect;

describe( "PROXY Protocol v1", function () {

	describe( 'net', function () {
		var server = tUtil.createServer( 'net', { strict: true });

		it( "Check socket is stablished correctly", function ( done ) {

			tUtil.testServer( server ).done( done );

		});

		it( "Check with another socket parameters", function ( done ) {

			tUtil.testServer(
				server,
				{
					clientAddress: '192.168.0.1',
					clientPort: 3350,
					proxyAddress: '192.168.0.254',
					proxyPort: 443,
				}
			)	.done( done );

		});

	});

});