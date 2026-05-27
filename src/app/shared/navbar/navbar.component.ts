import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { NgClass } from '@angular/common';
import { DemoDataService } from '../../services/demo-data.service';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, NgClass],
    templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  themeService = inject(ThemeService);
  demoData = inject(DemoDataService);

  showMobileMenu = signal(false);

  currentUserEmail = this.demoData.getCurrentUser().email;

  toggleMobileMenu() {
    this.showMobileMenu.update(value => !value);
  }

  resetDemoData() {
    this.demoData.resetDemoData();
    window.location.href = '/dashboard';
  }
}
