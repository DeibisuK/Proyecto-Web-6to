import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearMetodo } from './crear-metodo';

describe('CrearMetodo', () => {
  let component: CrearMetodo;
  let fixture: ComponentFixture<CrearMetodo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearMetodo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearMetodo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
