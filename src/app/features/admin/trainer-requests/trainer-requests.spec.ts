import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerRequests } from './trainer-requests';

describe('TrainerRequests', () => {
  let component: TrainerRequests;
  let fixture: ComponentFixture<TrainerRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
