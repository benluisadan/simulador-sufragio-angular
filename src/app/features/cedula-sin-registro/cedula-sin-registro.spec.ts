import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CedulaSinRegistro } from './cedula-sin-registro';

describe('CedulaVotacion', () => {
  let component: CedulaSinRegistro;
  let fixture: ComponentFixture<CedulaSinRegistro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CedulaSinRegistro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CedulaSinRegistro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
