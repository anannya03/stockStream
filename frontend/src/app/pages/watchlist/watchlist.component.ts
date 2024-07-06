import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface watchlistStockData {
  id: number;
  ticker: string;
  name: string;
}

export interface QuoteData {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [    
    MatProgressSpinnerModule,
    NgIf,
    NgFor,
  CommonModule],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  constructor(private apiService: ApiService, private router: Router) {}

navigateToSearch(ticker: string): void {
  this.router.navigate(['/search', ticker]);
}
  watchlist: watchlistStockData[] = [];
  watchlistQuotes: QuoteData[] = [];
  isLoading: boolean = false;


  ngOnInit(): void {
    this.loadFavoritesAndTheirQuotes();
  }

//   loadFavoritesAndTheirQuotes(): void {
//   this.isLoading = true;
//   this.apiService.getWishlist().pipe(
//     catchError(error => {
//       console.error('Failed to fetch watchlist:', error);
//       this.isLoading = false;
//       return of([]);
//     }),
//     switchMap((watchlist: watchlistStockData[]) => { 
//       if (watchlist.length === 0) {
//         this.isLoading = false;
//         return [];
//       }
//       this.watchlist = watchlist;
//       return forkJoin(watchlist.map((favorite: watchlistStockData) =>
//         this.apiService.fetchQuote(favorite.ticker).pipe(
//           catchError(error => {
//             console.error(`Failed to fetch quote for ${favorite.ticker}:`, error);
//             return of(null);
//           })
//         )
//       ));
//     }),
//     map((quotes: (QuoteData | null)[]) => quotes.filter(Boolean) as QuoteData[])
//   ).subscribe((quotes: QuoteData[]) => {
//     this.watchlistQuotes = quotes;
//     this.isLoading = false;
//   });
// }

// loadFavoritesAndTheirQuotes() {
//     this.isLoading = true;
//     this.apiService.getWishlist().subscribe(data => {
//       this.watchlist = data as watchlistStockData[];
//       if (this.watchlist.length === 0) {
//         this.isLoading = false;
//         return;
//       }
//       this.fetchQuotesForFavorites();
//     }, error => {
//       console.log('Failed to fetch watchlist:', error);
//       this.isLoading = false;
//     });
//   }

//   fetchQuotesForFavorites() {
//     const quotesObservables = this.watchlist.map(favorite => {
//       // get quote for each favorite
//       return this.apiService.fetchQuote(favorite.ticker).pipe(
//         catchError(error => {
//           console.error(`Failed to fetch quote for ${favorite.ticker}:`, error);
//           return of(null); // returns null if error
//         })
//       );
//     });
//     // wait for all quotes
//     forkJoin(quotesObservables).subscribe(quotes => {
//       this.watchlistQuotes = quotes.filter(quote => quote !== null) as QuoteData[];
//       this.isLoading = false; // Update loading state only after all quotes have been fetched
//     }, error => {
//       console.error('Failed to fetch quotes:', error);
//       this.isLoading = false;
//     });
//   }

loadFavoritesAndTheirQuotes() {
  this.isLoading = true;
  console.log("Inside watchlist");
  this.apiService.getWishlist().pipe(
    switchMap(data => {
      this.watchlist = data as watchlistStockData[];
      return this.watchlist.length ? forkJoin(this.watchlist.map(favorite =>
        this.apiService.fetchQuote(favorite.ticker).pipe(
          catchError(error => {
            console.error(`Failed to fetch quote for ${favorite.ticker}:`, error);
            return of(null); // returns null if error
          })
        )
      )) : of([]); // return empty array if no favorites to prevent further processing
    }),
    catchError(error => {
      console.error('Failed to fetch watchlist:', error);
      return of([]); // return empty array to handle error and prevent further processing
    })
  ).subscribe(quotes => {
    this.watchlistQuotes = quotes.filter(quote => quote !== null) as QuoteData[];
    this.isLoading = false;
  }, error => {
    console.error('Failed to fetch quotes:', error);
    this.isLoading = false;
  });
}


removeFromFavorites(symbol: string) {
      this.apiService.updateWishlist(symbol).subscribe(() => {
        console.log('Removed favorite:', symbol);
        this.loadFavoritesAndTheirQuotes();
      }, error => {
        console.log('Failed to remove favorite:', symbol, error);
      });
    }
}

