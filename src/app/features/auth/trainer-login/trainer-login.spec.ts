import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerLogin } from './trainer-login';

describe('TrainerLogin', () => {
  let component: TrainerLogin;
  let fixture: ComponentFixture<TrainerLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
