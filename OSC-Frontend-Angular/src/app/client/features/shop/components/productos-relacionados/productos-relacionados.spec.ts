import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosRelacionados } from './productos-relacionados';

describe('ProductosRelacionados', () => {
  let component: ProductosRelacionados;
  let fixture: ComponentFixture<ProductosRelacionados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosRelacionados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosRelacionados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
