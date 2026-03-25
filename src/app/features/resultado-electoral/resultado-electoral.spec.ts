import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoElectoral } from './resultado-electoral';

describe('ResultadoElectoral', () => {
  let component: ResultadoElectoral;
  let fixture: ComponentFixture<ResultadoElectoral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoElectoral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadoElectoral);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
