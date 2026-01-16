import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastrModule],
  template: `
    <div class="app-container">
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
    }

    :host {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: 0;
      padding: 0;
    }

    .app-container {
      display: flex;
      display: -ms-flexbox;
      flex-direction: column;
      -ms-flex-direction: column;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      overflow: hidden;
    }
    
    
    .app-main {
      flex: 1 1 auto;
      -ms-flex: 1 1 auto;
      margin: 0;
      padding: 0;
      position: relative;
      overflow: hidden;
    }
  `]
})
export class App {}
