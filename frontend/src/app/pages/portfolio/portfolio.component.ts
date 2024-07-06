import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, NgFor } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Subject, Subscription, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { StateDataService } from '../../services/state-data.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { OpenStockModalService } from '../../services/open-stock-modal.service';
import { MatDialog } from '@angular/material/dialog';
import { OpenStockModalService } from '../../services/open-stock-modal.service';
import { StockModalWindowComponent } from '../../components/stock-modal-window/stock-modal-window.component';



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

export interface HoldingData {
  id: number;
  ticker: string;
  quantity: number;
  cost: number;
}

export interface StockName {
  name: string;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    NgIf,
    NgFor,
    CommonModule
  ],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent {
  currentMoney = 0;
  currMoneyPortfolio: any;
  isLoading = false;
  holdings: HoldingData[] = [];
  holdingQuote: QuoteData[] = [];
  stockData: StockName[] = [];
  changeValue: any;
  searchResult: any;
  subscription: Subscription = new Subscription();
  private tradeStockAlert = new Subject<string>();
  tradeStockMessage = '';
  alertTypeBuy!: 'buy' | 'sell';
  ticker: any

  constructor(
    private apiService: ApiService,
    private stateData: StateDataService,
    private stockModalService: OpenStockModalService,
    public dialog: MatDialog
  ) {
    // this.stockModalService.searchResult$.subscribe(data => {
    //   if (data) {
    //     this.searchResult = data;
    //   }
    // });
    //this.calculateCurrentMoney();
  }

  ngOnInit() {


    this.tradeStockAlert.subscribe(message => {
      this.tradeStockMessage = message;
      setTimeout(() => this.tradeStockMessage = '', 5000);
    });

    this.fetchHoldings();
    this.subscription = this.stockModalService.searchResult$.subscribe(result => {
      this.searchResult = result;
    });

    this.apiService.getCurrentMoney().subscribe(result => {
      this.currentMoney = result[0].money;
      this.useCurrentMoney();
      // this.stateData.setCurrentMoney(result[0].money);

      console.log(this.currentMoney);
    }); 

    // this.currMoneyPortfolio = this.stateData.getCurrentMoney();

    console.log("sd :"+ this.currMoneyPortfolio);

  }

  useCurrentMoney() {
    this.currMoneyPortfolio = this.currentMoney;
    console.log("uecurrentmoney :"+ this.currMoneyPortfolio);

  }

  //this.stateData.setCurrentMoney(result[0].money);

  fetchHoldings() {
    this.isLoading = true;
    this.apiService.getPortfolio().subscribe(data => {
      this.holdings = data as HoldingData[];
      if (this.holdings.length === 0) {
        this.isLoading = false;
        return;
      }
      this.fetchStock();
      this.fetchQuotesForHoldings();
    }, error => {
      console.log('Failed to fetch holdings:', error);
      this.isLoading = false;
    });

  }

  // setChangeValue() {
  //    this.changeValue = (stock.cost/stock.quantity)
  // }

  fetchStock() {
    const namesObservables = this.holdings.map(holding => {
      // get quote for each favorite
      return this.apiService.fetchCompanyProfile(holding.ticker).pipe(
        catchError(error => {
          console.error(`Failed to fetch name for ${holding.ticker}:`, error);
          return of(null); // returns null if error
        })
      );
    });
    // wait for all quotes
    forkJoin(namesObservables).subscribe(names => {
      this.stockData = names.filter(name => name !== null) as StockName[];
      // this.isLoading = false; // Update loading state only after all quotes have been fetched
    }, error => {
      console.error('Failed to fetch quotes:', error);
      this.isLoading = false;
    });
  }

  isLessThanZero(stockCost: number, stockQuantity: number, currentPrice: number): boolean {
    const result = currentPrice - (stockCost / stockQuantity);
    return Number(result.toFixed(2)) < 0;
  }

  isGreaterThanZero(stockCost: number, stockQuantity: number, currentPrice: number): boolean {
    const result = currentPrice - (stockCost / stockQuantity);
    return Number(result.toFixed(2)) > 0;
  }

  isEqualToZero(stockCost: number, stockQuantity: number, currentPrice: number): boolean {
    const result = currentPrice - (stockCost / stockQuantity);
    return Number(result.toFixed(2)) === 0;
  }

  fetchQuotesForHoldings() {
    const quotesObservables = this.holdings.map(holding => {
      // get quote for each favorite
      return this.apiService.fetchQuote(holding.ticker).pipe(
        catchError(error => {
          console.error(`Failed to fetch quote for ${holding.ticker}:`, error);
          return of(null); // returns null if error
        })
      );
    });
    // wait for all quotes
    forkJoin(quotesObservables).subscribe(quotes => {
      this.holdingQuote = quotes.filter(quote => quote !== null) as QuoteData[];
      this.isLoading = false; // Update loading state only after all quotes have been fetched
    }, error => {
      console.error('Failed to fetch quotes:', error);
      this.isLoading = false;
    });
    //this.setChangeValue();
   
  }

  // buy(ticker: string, stockName: string, currentPrice: number, quantity: number, money: number){
  //   this.openBuySellBox(true, ticker, stockName, currentPrice, quantity, money);
  // }
  // sell(ticker: string, stockName: string, currentPrice: number, quantity: number, money: number){
  //   this.openBuySellBox(false, ticker, stockName, currentPrice, quantity, money);
  // }

  stockModal(toBuy: boolean, ticker: string, stockName: string, currentPrice: number, quantity: number, money: number) {
    console.log("Money: " + money + "ticker: " + ticker + "stockName: " + stockName + "currPrice: " + currentPrice + "q: " + quantity );
    this.ticker = ticker;
    const dialogVar = this.dialog.open(StockModalWindowComponent, {
      width: '400px',
      data: { 
        tickerSymbol: ticker,
        stockName: stockName,
        purchase: toBuy,
        marketPrice: currentPrice,
        ownedQuantity: quantity,
        money: money
       }
    });

  //   dialogVar.afterClosed().pipe(
  //     tap(() => console.log('Trade dialog has been closed. Updating holdings and balance.'))
  //   ).subscribe({
  //     next: () => this.calculateCurrentMoney()
  //   });
  // }

    // private calculateCurrentMoney(): void {
    //   // Logic to update current money
    //   this.currentMoney = this.stateData.getCurrentMoney();
    // }

    dialogVar.afterClosed().subscribe(result => {
      this.stockData = [];
      this.holdings = [];
      this.holdingQuote = [];
      this.fetchHoldings();
      this.apiService.getCurrentMoney().subscribe(result => {
        this.currentMoney = result[0].money;
      });

      if (result && result.success) {
        if (result.action === 'bought') {
          this.tradeStockAlert.next(this.ticker + " bought Successfully");
          this.alertTypeBuy = 'buy'; // Set your alert type for styling if needed
        } else if (result.action === 'sold') {
          this.tradeStockAlert.next(this.ticker + " sold Successfully");
          this.alertTypeBuy = 'sell'; // Set your alert type for styling if needed
        }
      }
    
    });
  }

  
  // }


  // stockModal(sell: boolean) {
  //   this.stockModalService.stockModal(sell);
  // }
}
