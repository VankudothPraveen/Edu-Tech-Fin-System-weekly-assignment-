import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoManagement } from './po-management';

describe('PoManagement', () => {
  let component: PoManagement;
  let fixture: ComponentFixture<PoManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
