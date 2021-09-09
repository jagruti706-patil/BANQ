import { TestBed } from '@angular/core/testing';

import { CoreauthService } from './coreauth.service';

describe('CoreauthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CoreauthService = TestBed.get(CoreauthService);
    expect(service).toBeTruthy();
  });
});
