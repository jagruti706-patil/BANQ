import { TestBed } from '@angular/core/testing';

import { VersionCheckServiceService } from './version-check-service.service';

describe('VersionCheckServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VersionCheckServiceService = TestBed.get(VersionCheckServiceService);
    expect(service).toBeTruthy();
  });
});
