import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CedulaSegundaVuelta } from './cedula-segunda-vuelta';

describe('CedulaSegundaVuelta', () => {
  let component: CedulaSegundaVuelta;
  let fixture: ComponentFixture<CedulaSegundaVuelta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CedulaSegundaVuelta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CedulaSegundaVuelta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
