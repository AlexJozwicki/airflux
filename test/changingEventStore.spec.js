var chai = require('chai'),
    assert = chai.assert,
    airflux = require('../src'),
    internalUtils = require('../src/utils');

chai.use(require('chai-as-promised'));

describe('Export internal EventEmitter', function() {
    it('should be the original', function() {
        assert.equal(internalUtils.EventEmitter, airflux.EventEmitter);
    });
});

describe('Switching the used EventEmitter to Node\'s internal', function() {
    var original;

    beforeEach(function() {
        original = internalUtils.EventEmitter;
        airflux.setEventEmitter(require('events').EventEmitter);
    });

    afterEach(function () {
        airflux.setEventEmitter(require('eventemitter3'));
    });

    it('should not be the original', function() {
        assert.notEqual(original, airflux.EventEmitter);
    });

    it('should have the same interface', function() {
        var ee = internalUtils.EventEmitter.prototype;
        assert.property(ee, 'addListener');
        assert.property(ee, 'removeListener');
        assert.property(ee, 'emit');
    });

});
