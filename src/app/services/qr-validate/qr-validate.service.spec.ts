import { TestBed } from '@angular/core/testing';

import { QrValidateService } from './qr-validate.service';

describe('QrValidateService', () => {
  let service: QrValidateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QrValidateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
