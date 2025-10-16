import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMetodo } from './list-metodo';

describe('ListMetodo', () => {
  let component: ListMetodo;
  let fixture: ComponentFixture<ListMetodo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMetodo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMetodo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
