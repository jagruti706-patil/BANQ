import { TestBed } from '@angular/core/testing';

import { AllConfigurationService } from './all-configuration.service';

describe('AllConfigurationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AllConfigurationService = TestBed.get(AllConfigurationService);
    expect(service).toBeTruthy();
  });
});
