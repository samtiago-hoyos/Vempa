import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
    
    <!-- Botón flotante de Instagram -->
    <a href="https://www.instagram.com/vempa_sport/" target="_blank" class="btn-instagram">
      <img src="https://api.iconify.design/mdi:instagram.svg?color=white" alt="Instagram" width="35" height="35">
    </a>
  `,
  styles: [`
    .btn-instagram {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background-color: #E1306C;
      border-radius: 50%;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0px 4px 6px rgba(0,0,0,0.3);
      transition: transform 0.3s ease;
      z-index: 1000;
    }
    
    .btn-instagram:hover {
      transform: scale(1.1);
    }
  `]
})
export class AppComponent {}