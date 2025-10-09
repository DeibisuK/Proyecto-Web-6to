import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorarTienda } from './explorar-tienda';

describe('ExplorarTienda', () => {
  let component: ExplorarTienda;
  let fixture: ComponentFixture<ExplorarTienda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorarTienda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExplorarTienda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
