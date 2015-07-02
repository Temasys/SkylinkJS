//Pre-config and global vars

var obj={};

describe('Event', function() {

	before(function(){
		Event.mixin(obj);
	});

	after(function(){

	});

	beforeEach(function(){

	});

	afterEach(function(){
		obj.off();
	});

	describe('#on()', function(){

		it.only('should bind event to object without error', function(){
			var arr = [];
			var count = 0;

			obj.on('event1', function(){
				arr.push(count);
			});

			obj.trigger('event1');

			arr.should.be.eql([0]);

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

	describe('#mixin()', function(){

		it('should embed event functions to the object', function(){

		});

	});

});







