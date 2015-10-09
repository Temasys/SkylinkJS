//Pre-config and global vars

var obj={};
var obj2={};
var arr=[];
var count=0;
var count2=0;

describe('Event', function() {

	describe('#_mixin()', function(){

		it('should embed event functions to the object', function(){

			Event._mixin(obj);
			Event._mixin(obj2);
			(typeof obj.on).should.be.eql('function');
			(typeof obj.off).should.be.eql('function');
			(typeof obj.once).should.be.eql('function');
			(typeof obj._trigger).should.be.eql('function');
			(typeof obj._removeListener).should.be.eql('function');

		});

	});

	describe('#on()', function(){

		it('should add callback to events list of on() listeners ', function(){

			var handler00 = function(){
				console.log('event0-handler0');
				count+=1;
			};

			var handler01 = function(){
				console.log('event0-handler1');
				count+=2;
			};		

			var handler02 = function(){
				console.log('event0-handler2');
				count+=3;
			};

			var handler10 = function(){
				console.log('event1-handler0');
				count+=4;
			};

			var handler11 = function(){
				console.log('event1-handler1');
				count+=5;
			};

			var handler200 = function(){
				console.log('obj2');
				count2++;
			}

			obj.on('event0', handler00);
			obj.on('event0', handler01);
			obj.on('event0', handler02);
			obj.on('event1', handler10);
			obj.on('event1', handler11);

			//Subscribe same events to obj2 for isolation test later
			obj2.on('event0', handler200);
			obj2.on('event1', handler200);
			obj2.on('event2', handler200);
			obj2.on('event3', handler200);

			obj.listeners.on['event0'].length.should.be.eql(3);
			obj.listeners.on['event1'].length.should.be.eql(2);

			(typeof obj.listeners.on['event0'][0]).should.be.eql('function');
			(typeof obj.listeners.on['event0'][1]).should.be.eql('function');
			(typeof obj.listeners.on['event0'][2]).should.be.eql('function');

			(typeof obj.listeners.on['event1'][0]).should.be.eql('function');
			(typeof obj.listeners.on['event1'][1]).should.be.eql('function');

			(obj.listeners.on['event0'][0].toString()).should.be.eql(handler00.toString());
			(obj.listeners.on['event0'][1].toString()).should.be.eql(handler01.toString());
			(obj.listeners.on['event0'][2].toString()).should.be.eql(handler02.toString());

			(obj.listeners.on['event1'][0].toString()).should.be.eql(handler10.toString());
			(obj.listeners.on['event1'][1].toString()).should.be.eql(handler11.toString());

		});

	});

	describe('#once()', function(){

		it('should add callback to events list of once() listeners', function(){

			var handler20 = function(){
				console.log('event2-handler0');
				count+=6;
			};

			var handler21 = function(){
				console.log('event2-handler1');
				count+=7;
			};

			var handler30 = function(){
				console.log('event3-handler0');
				count+=8;
			};

			obj.once('event2', handler20);
			obj.once('event2', handler21);
			obj.once('event3', handler30);

			obj.listeners.once['event2'].length.should.be.eql(2);
			obj.listeners.once['event3'].length.should.be.eql(1);

			(typeof obj.listeners.once['event2'][0]).should.be.eql('function');
			(typeof obj.listeners.once['event2'][1]).should.be.eql('function');
			(typeof obj.listeners.once['event3'][0]).should.be.eql('function');

			(obj.listeners.once['event2'][0].toString()).should.be.eql(handler20.toString());
			(obj.listeners.once['event2'][1].toString()).should.be.eql(handler21.toString());
			(obj.listeners.once['event3'][0].toString()).should.be.eql(handler30.toString());

		});

	});

	describe('#trigger()', function(){

		it('should trigger on() events', function(){
			obj._trigger('event0');
			count.should.be.eql(1+2+3);
		});

		it('should trigger once() events only once', function(){
			obj._trigger('event2');
			count.should.be.eql(1+2+3+6+7);
			obj._trigger('event2');
			count.should.be.eql(1+2+3+6+7);
			obj._trigger('event2');
			count.should.be.eql(1+2+3+6+7);
		});

		it('should trigger events in order', function(){
			obj._trigger('event1');
			count.should.be.eql(1+2+3+6+7+4+5);
			obj._trigger('event0');
			count.should.be.eql(1+2+3+6+7+4+5+1+2+3);
			obj._trigger('event2');
			count.should.be.eql(1+2+3+6+7+4+5+1+2+3);
			obj._trigger('event3');
			count.should.be.eql(1+2+3+6+7+4+5+1+2+3+8);
			obj._trigger('event3');
			count.should.be.eql(1+2+3+6+7+4+5+1+2+3+8);
		});

	});

	describe('#isolation', function(){
		it('should not interfere one objects event with another', function(){
			//obj's triggered events does not trigger obj2's same events
			count2.should.be.eql(0);
			obj2._trigger('event0');
			count2.should.be.eql(1);
		});
	});

	describe('#off()', function(){

		it('should unbind event from object without error', function(){
			obj.off('event0');
			obj.listeners.on['event0'].length.should.be.eql(0);
			obj.listeners.on['event1'].length.should.be.eql(2);
			obj.off('event1');
			obj.listeners.on['event1'].length.should.be.eql(0);
			obj2.off();
			obj2.listeners.on.should.be.equal({});
		});

	});

});







