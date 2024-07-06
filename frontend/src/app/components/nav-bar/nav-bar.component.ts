import { Component } from '@angular/core';
import { Router, RouterLinkActive, NavigationEnd } from '@angular/router';
import { StateDataService } from '../../services/state-data.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    RouterLinkActive,
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
    currentRoute: string = '';

    constructor(private router: Router, private stateData: StateDataService) {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.urlAfterRedirects;
        }
      });
    }

    isActive(route: string): boolean {
      return this.currentRoute.startsWith(route); 
    }

    // navigate to search page
    search() {      
      const lastSearchArg = this.stateData.getLastSearchArg();
      if (lastSearchArg) {
        this.router.navigate(['/search', lastSearchArg]);
      } else {
        this.router.navigate(['/search']);
      }
    }

    // navigate to watchlist page
    watchlist() {
      this.router.navigate(['/watchlist']);
    }

    // navigate to portfolio page
    portfolio() {
      this.router.navigate(['/portfolio']);
    }
}
