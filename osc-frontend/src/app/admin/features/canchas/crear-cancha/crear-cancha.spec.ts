import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCancha } from './crear-cancha';

describe('CrearCancha', () => {
  let component: CrearCancha;
  let fixture: ComponentFixture<CrearCancha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCancha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearCancha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
