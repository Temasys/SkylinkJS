//Pre-config and global vars

var obj={};

describe('Event', function() {

	before(function(){

	});

	after(function(){

	});

	beforeEach(function(){

	});

	afterEach(function(){
		obj.off();
	});

	describe('#mixin()', function(){

		it('should embed event functions to the object', function(){
			Event.mixin(obj);
			(typeof obj.on).should.be.eql('function');
			(typeof obj.off).should.be.eql('function');
			(typeof obj.once).should.be.eql('function');
			(typeof obj.trigger).should.be.eql('function');
			(typeof obj.removeListener).should.be.eql('function');
		});

	});

	describe('#on()', function(){

		it('should bind event to object without error', function(){

			var handler0 = function(){
				console.log('first handler');
			};

			var handler1 = function(){
				console.log('second handler');
			};		

			var handler2 = function(){
				console.log('third handler');
			};	

			obj.on('event', handler0);
			obj.on('event', handler1);
			obj.on('event', handler2);

			obj.listeners.on['event'].length.should.be.eql(4);

			(typeof obj.listeners.on['event'][0]).should.be.eql('function');
			(typeof obj.listeners.on['event'][1]).should.be.eql('function');
			(typeof obj.listeners.on['event'][2]).should.be.eql('function');

			(obj.listeners.on['event'][0].toString()).should.be.eql(handler0.toString());
			(obj.listeners.on['event'][1].toString()).should.be.eql(handler1.toString());
			(obj.listeners.on['event'][2].toString()).should.be.eql(handler2.toString());

		});

		it('should trigger events in order', function(){

		});

	});

	describe('#off()', function(){

		it('should unbind event from object without error', function(){

		});

	});

	describe('#trigger()', function(){

		it('should trigger event without error', function(){

		});

	});

	describe('#once()', function(){

		it('should trigger event only once', function(){

		});

	});

});







