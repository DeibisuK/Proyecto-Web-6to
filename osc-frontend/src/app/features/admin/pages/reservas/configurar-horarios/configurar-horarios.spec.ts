import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigurarHorarios } from './configurar-horarios';

describe('ConfigurarHorarios', () => {
  let component: ConfigurarHorarios;
  let fixture: ComponentFixture<ConfigurarHorarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurarHorarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurarHorarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
