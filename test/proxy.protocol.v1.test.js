var Util = require( 'findhit-util' ),
	tUtil = require( './tests.util' ),
	Promise = require( 'bluebird' ),

	sinon = require( 'sinon' ),
	chai = require( 'chai' ),
	expect = chai.expect;

describe( "PROXY Protocol v1", function () {

	describe( 'net', function () {
		var server = tUtil.createServer( 'net', { strict: true });

		it( "Check socket is stablished correctly", function () {
			return tUtil.fakeConnect( server );
		});

		it( "Check with another socket parameters", function () {
			return tUtil.fakeConnect(
				server,
				{
					clientAddress: '192.168.0.1',
					clientPort: 3350,
					proxyAddress: '192.168.0.254',
					proxyPort: 443,
				}
			);
		});

		it( "Check with another socket parameters as a string", function () {
			return tUtil.fakeConnect(
				server,
				{
					header: 'PROXY TCP4 192.168.0.1 192.168.0.254 3350 443',
				}
			);
		});

		describe( "Should detect a malformed PROXY headers", function () {

			it( "Header without IP's", function () {
				var self = this;

				return tUtil.fakeConnect( server, {
					header: 'PROXY HACK ATTEMPT',
				})
					.then(function () {
						throw new Error("It shouldn't get fulfilled");
					}, function ( err ) {
						expect( err ).to.be.equal( "PROXY protocol error" );
					});

			});

			it( "Restore emitted events after socket.destroy #5", function () {
				var self = this;

				return tUtil.fakeConnect( server, {
					header: 'PRO',
					autoCloseSocket: false,
					testAttributes: false,
				})
					.then(function () {
						throw new Error("It shouldn't get fulfilled");
					}, function ( err ) {
						expect( err ).to.be.equal( "PROXY protocol error" );
					});

			});

		});

	});

});
