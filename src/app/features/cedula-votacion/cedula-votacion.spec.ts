import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CedulaVotacion } from './cedula-votacion';

describe('CedulaVotacion', () => {
  let component: CedulaVotacion;
  let fixture: ComponentFixture<CedulaVotacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CedulaVotacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CedulaVotacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
