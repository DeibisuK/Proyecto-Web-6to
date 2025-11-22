import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListVentas } from './list-ventas';

describe('ListVentas', () => {
  let component: ListVentas;
  let fixture: ComponentFixture<ListVentas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListVentas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListVentas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
