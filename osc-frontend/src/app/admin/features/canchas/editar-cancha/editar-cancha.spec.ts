import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCancha } from './editar-cancha';

describe('EditarCancha', () => {
  let component: EditarCancha;
  let fixture: ComponentFixture<EditarCancha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarCancha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarCancha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
