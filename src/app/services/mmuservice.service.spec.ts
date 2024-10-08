import { TestBed } from '@angular/core/testing';

import { MMUServiceService } from './mmuservice.service';

describe('MMUServiceService', () => {
  let service: MMUServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MMUServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
