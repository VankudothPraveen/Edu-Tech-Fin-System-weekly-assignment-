import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Po } from './po';

describe('Po', () => {
  let component: Po;
  let fixture: ComponentFixture<Po>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Po]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Po);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
