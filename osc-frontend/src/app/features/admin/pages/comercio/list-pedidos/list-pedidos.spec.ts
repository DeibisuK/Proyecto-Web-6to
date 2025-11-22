import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPedidos } from './list-pedidos';

describe('ListPedidos', () => {
  let component: ListPedidos;
  let fixture: ComponentFixture<ListPedidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPedidos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPedidos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
