import { Component, Input } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  template: `
    <a
      class="boton-whatsapp"
      [href]="href"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      [title]="numeroWhatsapp ? 'Escribir por WhatsApp' : 'Configura whatsappNumber en environment.ts'"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path
          d="M17.6 6.32A8.86 8.86 0 0 0 12.01 3.5a8.94 8.94 0 0 0-7.74 13.4L3.5 21l4.22-1.1a8.9 8.9 0 0 0 4.28 1.09h.01a8.94 8.94 0 0 0 8.94-8.93 8.87 8.87 0 0 0-2.65-6.24Zm-5.6 13.74h-.01a7.42 7.42 0 0 1-3.78-1.04l-.27-.16-2.5.66.67-2.44-.18-.28a7.44 7.44 0 1 1 13.83-3.92 7.4 7.4 0 0 1-7.76 7.18Zm4.08-5.56c-.22-.11-1.32-.65-1.53-.73-.2-.08-.35-.11-.5.11-.15.22-.57.73-.7.88-.13.15-.26.16-.48.05a6.1 6.1 0 0 1-1.8-1.11 6.75 6.75 0 0 1-1.24-1.55c-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.5-1.21-.69-1.66-.18-.43-.36-.37-.5-.38h-.43c-.15 0-.39.06-.6.28-.2.22-.79.77-.79 1.87 0 1.1.81 2.16.92 2.31.11.15 1.6 2.44 3.87 3.42.54.23.96.37 1.29.48.54.17 1.03.15 1.42.09.43-.06 1.32-.54 1.51-1.06.19-.52.19-.96.13-1.06-.06-.1-.2-.15-.42-.26Z"
        />
      </svg>
    </a>
  `,
})
export class WhatsAppButtonComponent {
  @Input() mensaje?: string;
  numeroWhatsapp = environment.whatsappNumber;

  get href(): string {
    const texto = encodeURIComponent(this.mensaje || 'Hola VEMPA, quiero más información sobre un producto');
    return this.numeroWhatsapp ? `https://wa.me/${this.numeroWhatsapp}?text=${texto}` : '#';
  }
}
