import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeporteSelector } from './deporte-selector';

describe('DeporteSelector', () => {
  let component: DeporteSelector;
  let fixture: ComponentFixture<DeporteSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeporteSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeporteSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
