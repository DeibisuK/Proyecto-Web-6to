import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSede } from './list-sede';

describe('ListSede', () => {
  let component: ListSede;
  let fixture: ComponentFixture<ListSede>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSede]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSede);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
