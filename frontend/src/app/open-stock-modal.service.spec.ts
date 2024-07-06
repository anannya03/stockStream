import { TestBed } from '@angular/core/testing';

import { OpenStockModalService } from './services/open-stock-modal.service';

describe('OpenStockModalService', () => {
  let service: OpenStockModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenStockModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
