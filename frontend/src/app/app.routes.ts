import { Routes } from '@angular/router';
import { WatchlistComponent } from './pages/watchlist/watchlist.component';
import { PortfolioComponent } from './pages/portfolio/portfolio.component';
import { SearchComponent } from './pages/search/search.component';

export const routes: Routes = [
    { path: '', redirectTo: 'search/home', pathMatch: 'full'},//default route
    { path: 'search', redirectTo: 'search/home', pathMatch: 'full'}, //route via search 
    { path: 'search/:ticker',component: SearchComponent},
    { path: 'watchlist', component: WatchlistComponent},
    { path: 'portfolio', component: PortfolioComponent},
    { path: 'search/home', component: SearchComponent}
  ];
