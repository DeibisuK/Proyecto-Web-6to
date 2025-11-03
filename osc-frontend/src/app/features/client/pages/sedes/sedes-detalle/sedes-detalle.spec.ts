import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SedesDetalle } from './sedes-detalle';

describe('SedesDetalle', () => {
  let component: SedesDetalle;
  let fixture: ComponentFixture<SedesDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SedesDetalle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SedesDetalle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
