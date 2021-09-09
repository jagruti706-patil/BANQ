import { TestBed } from '@angular/core/testing';

import { SearchfiltersService } from './searchfilters.service';

describe('SearchfiltersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SearchfiltersService = TestBed.get(SearchfiltersService);
    expect(service).toBeTruthy();
  });
});
