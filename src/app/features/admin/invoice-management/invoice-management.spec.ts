import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceManagement } from './invoice-management';

describe('InvoiceManagement', () => {
  let component: InvoiceManagement;
  let fixture: ComponentFixture<InvoiceManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
