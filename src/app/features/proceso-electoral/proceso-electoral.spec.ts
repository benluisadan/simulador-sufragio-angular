import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcesoElectoral } from './proceso-electoral';

describe('ProcesoElectoral', () => {
  let component: ProcesoElectoral;
  let fixture: ComponentFixture<ProcesoElectoral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcesoElectoral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcesoElectoral);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
