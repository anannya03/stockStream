import { Component } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterOutlet,RouterLink, RouterModule } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { SearchBoxComponent } from './components/search-box/search-box.component';
// import { PortfolioComponent } from './pages/portfolio/portfolio.component';
// import { SearchComponent } from './components/searchDetails/search.component';
// import { WatchlistComponent } from './pages/watchlist/watchlist.component';
import { FooterComponent } from './components/footer/footer.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, 
    RouterLink,
    RouterModule, 
    NgbModule, 
    NavBarComponent, 
    FontAwesomeModule,
    // SearchBoxComponent, 
    // PortfolioComponent, 
    // WatchlistComponent, 
    // SearchComponent,
    FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})


export class AppComponent {
  title = 'frontend';
}
