import { TestBed } from '@angular/core/testing';

import { DatatransaferService } from './datatransafer.service';

describe('DatatransaferService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DatatransaferService = TestBed.get(DatatransaferService);
    expect(service).toBeTruthy();
  });
});
