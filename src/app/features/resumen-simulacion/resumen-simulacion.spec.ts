import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenSimulacion } from './resumen-simulacion';

describe('ResumenSimulacion', () => {
  let component: ResumenSimulacion;
  let fixture: ComponentFixture<ResumenSimulacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenSimulacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumenSimulacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
