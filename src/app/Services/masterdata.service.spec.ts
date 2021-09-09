import { TestBed } from '@angular/core/testing';

import { MasterdataService } from './masterdata.service';

describe('MasterdataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MasterdataService = TestBed.get(MasterdataService);
    expect(service).toBeTruthy();
  });
});
