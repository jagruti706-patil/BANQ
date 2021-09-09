import { TestBed } from '@angular/core/testing';

import { CoreoperationsService } from './coreoperations.service';

describe('CoreoperationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CoreoperationsService = TestBed.get(CoreoperationsService);
    expect(service).toBeTruthy();
  });
});
