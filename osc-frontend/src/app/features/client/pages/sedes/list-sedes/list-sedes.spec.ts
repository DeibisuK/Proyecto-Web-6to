import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSedes } from './list-sedes';

describe('ListSedes', () => {
  let component: ListSedes;
  let fixture: ComponentFixture<ListSedes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSedes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSedes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
