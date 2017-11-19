/**
 * Tests the init() method
 */
describe('init()', function() {

  describe('When provided as (appKey)', function () {
    var skylink = new Skylink();
    var states = [];

    skylink.on('readyStateChange')

    it('')


  })

  /*describe('Error cases', function () {

    it('When app key is invalid', function (done) {
      var skylink = new Skylink();
      var testKey = appkeys.p2p.id + '-1';
      var states = [];

      skylink.on('readyStateChange', function (readyState, error, room) {

        states.push({
          readyState: readyState,
          error: error,
          room: room
        });

      });

      skylink.init(testKey, function (error, success) {

        it('readyStateChange[0] is INIT', function () {
          expect(states[0].readyState).to.eql(Skylink.prototype.READY_STATE_CHANGE.INIT);
          expect(states[0].error).to.eql(null);
          expect(states[0].room).to.eql(testKey);
        });

        it('readyStateChange[1] is ERROR', function () {
          expect(states[0].readyState).to.eql(Skylink.prototype.READY_STATE_CHANGE.ERROR);
          expect(states[0].error.status).to.not.eql(200);
          assert.isNumber(states[0].error.errorCode);
          assert.ifError(states[0].error.content);
          expect(states[0].room).to.eql(testKey);
        });

        done();

      });

    });

  });*/

});