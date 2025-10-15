import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sedes } from './sedes';

describe('Sedes', () => {
  let component: Sedes;
  let fixture: ComponentFixture<Sedes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sedes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sedes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
