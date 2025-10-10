import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaracteristicasPrincipales } from './caracteristicas-principales';

describe('CaracteristicasPrincipales', () => {
  let component: CaracteristicasPrincipales;
  let fixture: ComponentFixture<CaracteristicasPrincipales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaracteristicasPrincipales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaracteristicasPrincipales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
