'use strict';

describe('Service: administrativawsoService', function () {

  // load the service's module
  beforeEach(module('contractualClienteApp'));

  // instantiate service
  var administrativawsoService;
  beforeEach(inject(function (_administrativawsoService_) {
    administrativawsoService = _administrativawsoService_;
  }));

  it('should do something', function () {
    expect(!!administrativawsoService).toBe(true);
  });

});
