'use strict';

describe('Service: coreAmazonCrud', function () {

  // load the service's module
  beforeEach(module('contractualClienteApp'));

  // instantiate service
  var coreAmazonCrud;
  beforeEach(inject(function (_coreAmazonCrud_) {
    coreAmazonCrud = _coreAmazonCrud_;
  }));

  it('should do something', function () {
    expect(!!coreAmazonCrud).toBe(true);
  });

});
