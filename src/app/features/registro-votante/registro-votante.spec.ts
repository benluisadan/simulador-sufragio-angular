import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroVotante } from './registro-votante';

describe('RegistroVotante', () => {
  let component: RegistroVotante;
  let fixture: ComponentFixture<RegistroVotante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroVotante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroVotante);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
