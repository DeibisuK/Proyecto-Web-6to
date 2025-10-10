import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuntosLealtad } from './puntos-lealtad';

describe('PuntosLealtad', () => {
  let component: PuntosLealtad;
  let fixture: ComponentFixture<PuntosLealtad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuntosLealtad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuntosLealtad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
