import { TestBed } from '@angular/core/testing';

import { AccountactivationService } from './accountactivation.service';

describe('AccountactivationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccountactivationService = TestBed.get(AccountactivationService);
    expect(service).toBeTruthy();
  });
});
