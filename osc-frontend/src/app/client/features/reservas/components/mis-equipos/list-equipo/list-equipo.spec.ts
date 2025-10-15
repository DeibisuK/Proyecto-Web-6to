import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEquipo } from './list-equipo';

describe('ListEquipo', () => {
  let component: ListEquipo;
  let fixture: ComponentFixture<ListEquipo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListEquipo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListEquipo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
