import { TestBed } from '@angular/core/testing';

import { AdmiGroupService } from './admi-group.service';

describe('AdmiGroupService', () => {
  let service: AdmiGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdmiGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
