import { TestBed } from '@angular/core/testing';

import { StateDataService } from './state-data.service';

describe('StateDataService', () => {
  let service: StateDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
