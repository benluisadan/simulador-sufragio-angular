import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingDonaciones } from './landing-donaciones';

describe('LandingDonaciones', () => {
  let component: LandingDonaciones;
  let fixture: ComponentFixture<LandingDonaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingDonaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingDonaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
