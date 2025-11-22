import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListReservas } from './list-reservas';

describe('ListReservas', () => {
  let component: ListReservas;
  let fixture: ComponentFixture<ListReservas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListReservas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListReservas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
