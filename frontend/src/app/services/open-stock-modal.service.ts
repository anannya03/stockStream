import { Injectable, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StockModalWindowComponent } from '../components/stock-modal-window/stock-modal-window.component'
import { tap } from 'rxjs';
import { StateDataService } from './state-data.service';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';

export interface HoldingData {
  id: number;
  ticker: string;
  name: string;
  quantity: number;
  cost: number;
}

@Injectable({
  providedIn: 'root'
})

export class OpenStockModalService {

  private searchResultSource = new BehaviorSubject<any>(null);
  searchResult$ = this.searchResultSource.asObservable();

  setSearchResult(data: any) {
    this.searchResultSource.next(data);
  }

  holdingQuantity: number = 0;
  currentMoney = 0;
  isHolding: boolean = false;

  constructor(public dialog: MatDialog,
    private stateData: StateDataService,
    private apiService: ApiService
    ) { }

  stockModal(sell: boolean) {
    this.searchResult$.subscribe({
      next: (searchResult) => {
        // Check if the searchResult is valid
        if (!searchResult || !searchResult.profile || !searchResult.quote) {
          console.error('No search result available');
          return;
        }

    let tradeDialogRef = this.dialog.open(StockModalWindowComponent, {
      width: '400px',
      data: { 
        tickerSymbol: searchResult.profile.ticker, 
        purchase: sell,
        ownedQuantity: this.holdingQuantity,
        marketPrice: searchResult.quote.c,
       }
    });

    tradeDialogRef.afterClosed().subscribe({
        next: () => {
          console.log('Trade dialog has been closed. Updating holdings and balance.');
          this.updateFinancialData();
        }
      });
}
    });
  }

private updateFinancialData(): void {
  this.fetchCurrentStocks();
  this.calculateCurrentMoney();
}

private calculateCurrentMoney(): void {
  // Logic to update current money
  this.currentMoney = this.stateData.getCurrentMoney();
}

fetchCurrentStocks() {
  // Directly access the current value of searchResultSource
  const searchResult = this.searchResultSource.getValue();

  // Check if searchResult is valid before proceeding
  if (!searchResult || !searchResult.profile) {
    console.error('No search result available');
    return;
  }

  console.log(searchResult.profile);

  this.apiService.getPortfolio().subscribe(holdings => {
    const holdingsArray = holdings as HoldingData[];
    this.isHolding = holdingsArray.some(holding => holding.ticker === searchResult.profile.ticker);
    this.holdingQuantity = holdingsArray.find(holding => holding.ticker === searchResult.profile.ticker)?.quantity || 0;
  });
}


// fetchCurrentStocks() {
//   console.log(this.searchResult.profile);
//   this.apiService.getPortfolio().subscribe(holdings => {
//     const holdingsArray = holdings as HoldingData[];
//     this.isHolding = holdingsArray.some(holding => holding.ticker === this.searchResult.profile.ticker);
//     this.holdingQuantity = holdingsArray.find(holding => holding.ticker === this.searchResult.profile.ticker)?.quantity || 0;
//   })
// }

}
