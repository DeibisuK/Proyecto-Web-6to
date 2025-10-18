import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleReservarCancha } from './detalle-reservar-cancha';

describe('DetalleReservarCancha', () => {
  let component: DetalleReservarCancha;
  let fixture: ComponentFixture<DetalleReservarCancha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleReservarCancha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleReservarCancha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
