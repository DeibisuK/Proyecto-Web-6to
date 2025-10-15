import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCancha } from './list-cancha';

describe('ListCancha', () => {
  let component: ListCancha;
  let fixture: ComponentFixture<ListCancha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCancha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCancha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
