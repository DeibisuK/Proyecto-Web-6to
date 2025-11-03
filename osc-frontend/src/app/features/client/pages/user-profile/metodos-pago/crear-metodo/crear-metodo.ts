import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MetodoPagoService } from '@shared/services/index';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { MetodoPago, MetodoPagoRequest } from '@shared/models/index';

@Component({
  selector: 'app-crear-metodo',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-metodo.html',
  styleUrl: './crear-metodo.css'
})
export class CrearMetodo implements OnInit, OnChanges, OnDestroy {
  @Input() isModalOpen: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() cardAdded = new EventEmitter<MetodoPago>();

  private fb = inject(FormBuilder);
  private metodoPagoService = inject(MetodoPagoService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  cardForm: FormGroup;
  cardType: string = '';
  isLoading: boolean = false;

  constructor() {
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(13)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
    });
  }

  ngOnInit() {
    // Detectar tipo de tarjeta mientras se escribe
    this.cardForm.get('cardNumber')?.valueChanges.subscribe(value => {
      if (value) {
        this.cardType = this.metodoPagoService.detectarTipoTarjeta(value);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isModalOpen']) {
      if (this.isModalOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalClosed.emit();
    this.cardForm.reset();
    this.cardType = '';
    document.body.style.overflow = 'auto';
  }

  addCard() {
    if (!this.cardForm.valid) {
      this.notificationService.error('Por favor, completa todos los campos correctamente');
      return;
    }

    const currentUser = this.authService.currentUser;

    if (!currentUser) {
      this.notificationService.error('Debes iniciar sesión');
      return;
    }

    const cardData = this.cardForm.value;

    // Validar número de tarjeta
    if (!this.metodoPagoService.validarNumeroTarjeta(cardData.cardNumber)) {
      this.notificationService.error('Número de tarjeta no válido');
      return;
    }

    // Validar CVV
    if (!this.metodoPagoService.validarCVV(cardData.cvv)) {
      this.notificationService.error('CVV no válido');
      return;
    }

    this.isLoading = true;

    // Convertir fecha MM/YY a formato para la API
    const [month, year] = cardData.expiryDate.split('/');
    const fechaExpiracion = `${month}/${year}`;

    const metodoPagoRequest: MetodoPagoRequest = {
      firebase_uid: currentUser.uid,
      numero_tarjeta: cardData.cardNumber.replace(/\s/g, ''), // Remover espacios
      fecha_expiracion: fechaExpiracion,
      cvv: cardData.cvv
    };

    this.metodoPagoService.addMetodoPago(metodoPagoRequest).subscribe({
      next: (response) => {
        this.notificationService.success(response.message || 'Tarjeta agregada correctamente');
        this.cardAdded.emit(response.metodo);
        this.closeModal();
        this.isLoading = false;
      },
      error: (error) => {
        const errorMessage = error.error?.error || 'No se pudo agregar la tarjeta';
        this.notificationService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      value = parts.join(' ');
    }

    event.target.value = value;
    this.cardForm.patchValue({ cardNumber: value }, { emitEvent: false });
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }

    event.target.value = value;
    this.cardForm.patchValue({ expiryDate: value }, { emitEvent: false });
  }

  // Obtener icono del tipo de tarjeta
  getCardIcon(): string {
    const iconMap: { [key: string]: string } = {
      'Visa': 'fab fa-cc-visa',
      'Mastercard': 'fab fa-cc-mastercard',
      'American Express': 'fab fa-cc-amex',
      'Discover': 'fab fa-cc-discover',
      'Diners Club': 'fab fa-cc-diners-club',
      'JCB': 'fab fa-cc-jcb',
      'Tarjeta de Crédito': 'fas fa-credit-card',
      'Tarjeta Virtual': 'fas fa-mobile-alt',
      'Tarjeta Corporativa': 'fas fa-building',
      'Tarjeta de Débito': 'fas fa-university',
      'Tarjeta Prepago': 'fas fa-gift',
      'Tarjeta Bancaria': 'fas fa-landmark',
      'Tarjeta de Servicios': 'fas fa-tools',
      'Tarjeta de Comercio': 'fas fa-store',
      'Tarjeta de Pago': 'fas fa-money-bill-wave'
    };
    return iconMap[this.cardType] || 'fas fa-credit-card';
  }

  // Obtener color del tipo de tarjeta
  getCardColor(): string {
    const colorMap: { [key: string]: string } = {
      'Visa': '#1434CB',
      'Mastercard': '#FF5F00',
      'American Express': '#006FCF',
      'Discover': '#FF6000',
      'Diners Club': '#0079BE',
      'JCB': '#006EBA',
      'Tarjeta de Crédito': '#28a745',
      'Tarjeta Virtual': '#17a2b8',
      'Tarjeta Corporativa': '#6c757d',
      'Tarjeta de Débito': '#fd7e14',
      'Tarjeta Prepago': '#e83e8c',
      'Tarjeta Bancaria': '#007bff',
      'Tarjeta de Servicios': '#6f42c1',
      'Tarjeta de Comercio': '#20c997',
      'Tarjeta de Pago': '#666'
    };
    return colorMap[this.cardType] || '#666';
  }
}

