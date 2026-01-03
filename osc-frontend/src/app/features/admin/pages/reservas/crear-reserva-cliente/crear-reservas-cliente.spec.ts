import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearReservas } from './crear-reservas-cliente';

describe('CrearReservas', () => {
  let component: CrearReservas;
  let fixture: ComponentFixture<CrearReservas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearReservas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearReservas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
