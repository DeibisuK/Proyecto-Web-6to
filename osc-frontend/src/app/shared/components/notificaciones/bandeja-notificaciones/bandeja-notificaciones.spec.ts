import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandejaNotificaciones } from './bandeja-notificaciones';

describe('BandejaNotificaciones', () => {
  let component: BandejaNotificaciones;
  let fixture: ComponentFixture<BandejaNotificaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BandejaNotificaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BandejaNotificaciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
