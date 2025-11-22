import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Partidos } from './partidos';

describe('Partidos', () => {
  let component: Partidos;
  let fixture: ComponentFixture<Partidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Partidos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Partidos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
