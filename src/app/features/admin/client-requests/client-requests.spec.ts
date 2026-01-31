import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRequests } from './client-requests';

describe('ClientRequests', () => {
  let component: ClientRequests;
  let fixture: ComponentFixture<ClientRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
