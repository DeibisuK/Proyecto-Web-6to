import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticaDePrivacidad } from './politica-de-privacidad';

describe('PoliticaDePrivacidad', () => {
  let component: PoliticaDePrivacidad;
  let fixture: ComponentFixture<PoliticaDePrivacidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticaDePrivacidad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticaDePrivacidad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
