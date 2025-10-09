import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroPanel } from './filtro-panel';

describe('FiltroPanel', () => {
  let component: FiltroPanel;
  let fixture: ComponentFixture<FiltroPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltroPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
