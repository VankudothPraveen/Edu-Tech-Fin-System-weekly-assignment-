import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerRegister } from './trainer-register';

describe('TrainerRegister', () => {
  let component: TrainerRegister;
  let fixture: ComponentFixture<TrainerRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
