import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardTorneo } from './dashboard-torneo';

describe('DashboardTorneo', () => {
  let component: DashboardTorneo;
  let fixture: ComponentFixture<DashboardTorneo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTorneo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardTorneo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
