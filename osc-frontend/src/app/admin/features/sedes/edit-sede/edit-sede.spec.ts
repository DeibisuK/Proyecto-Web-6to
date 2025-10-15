import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSede } from './edit-sede';

describe('EditSede', () => {
  let component: EditSede;
  let fixture: ComponentFixture<EditSede>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSede]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSede);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
