'use strict';

describe('Service: administrativaAmazonService', function () {

  // load the service's module
  beforeEach(module('contractualClienteApp'));

  // instantiate service
  var administrativaAmazonService;
  beforeEach(inject(function (_administrativaAmazonService_) {
    administrativaAmazonService = _administrativaAmazonService_;
  }));

  it('should do something', function () {
    expect(!!administrativaAmazonService).toBe(true);
  });

});
