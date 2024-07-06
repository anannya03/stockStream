import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts/highstock';
import indicators from 'highcharts/indicators/indicators';
import vbp from 'highcharts/indicators/volume-by-price';
import { MatTabsModule } from '@angular/material/tabs';
import { ChangeDetectorRef } from '@angular/core';
import { faStar as farFaStar } from '@fortawesome/free-regular-svg-icons'; // For regular star
import { faStar as fasFaStar } from '@fortawesome/free-solid-svg-icons'; // For solid star
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StockModalWindowComponent } from '../stock-modal-window/stock-modal-window.component';
import { debounceTime, startWith, tap } from 'rxjs/operators';

indicators(Highcharts);
vbp(Highcharts);

import { MatDialog } from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewsModalWindowComponent } from '../news-modal-window/news-modal-window.component';
import { NewsData } from '../../interfaces/news-data';

import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { ApiService } from '../../services/api.service';

// 
import { StateDataService } from '../../services/state-data.service';
import { OpenStockModalService } from '../../services/open-stock-modal.service';
import { Observable, Subject, Subscription, interval } from 'rxjs';

export interface FavoriteData {
  id: number;
  ticker: string;
  name: string;
}

export interface HoldingData {
  id: number;
  ticker: string;
  name: string;
  quantity: number;
  cost: number;
}

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatProgressSpinnerModule,
    HighchartsChartModule,
    MatCardModule,
    MatDialogModule,
    MdbTabsModule,
    MatTabsModule,
    NewsModalWindowComponent,
    FontAwesomeModule,
    StockModalWindowComponent
  ],
  templateUrl: './company-profile.component.html',
  styleUrl: './company-profile.component.css'
})

export class CompanyProfileComponent implements OnInit{
  @Output() peerClicked: EventEmitter<string> = new EventEmitter<string>();
  farStar = farFaStar;
  faStar = fasFaStar;
  private _searchResult: any;
  showBanner: boolean = false;
  alertType!: 'add' | 'remove';

  private wishlistAlert = new Subject<string>();
  private tradeStockAlert = new Subject<string>();
  wishlistMessage = '';
  tradeStockMessage = '';

  @Input() searchLoading: boolean = false;
  @Input() companyProfile: boolean = false;
  @Input() searchResult: any;

  currentMoney = 0;
  marketStatus: any;
  prevTime= new Date().toLocaleString();
  currentTime= new Date().toLocaleString();
  line: any;

  isError: boolean = false;

  hourDataCharts: typeof Highcharts = Highcharts;
  hourlyConstructor = "stockChart";
  hourlyOptions: Highcharts.Options = {};
  recommendCharts: typeof Highcharts = Highcharts;
  recommendOptions: Highcharts.Options = {};
  estimateCharts: typeof Highcharts = Highcharts;
  estimateOptions: Highcharts.Options = {};
  chart: typeof Highcharts = Highcharts;
  createChart = "stockChart";

  totalMSPR = 0;
  positiveMSPR = 0; 
  negativeMSPR = 0;
  totalChange = 0;
  positiveChange = 0; 
  negativeChange = 0;

  newsData: any[] = [];

  chartOptions: Highcharts.Options = {};

  isFavorite: boolean = false;
  isHolding: boolean = false;
  holdingQuantity: number = 0;
  alertTypeBuy!: 'buy' | 'sell';
  private updateSubscription!: Subscription;


  constructor(
    public dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private newsModalService: NgbModal,
    private apiService: ApiService,
    private router: Router,
    private stateData: StateDataService,
    private stockModalService: OpenStockModalService
    ) {
    this.calculateCurrentMoney();
    // this.stockModalService.searchResult$.subscribe(data => {
    //   if (data) {
    //     this.searchResult = data;
    //   }
    // });
    }

  // @Input()
  // set searchResult(value: any) {
  //   // Detect changes by comparing the new value to the current value
  //   if (value !== this._searchResult) {
  //     this._searchResult = value;
  //     console.log("inside1");
  //     this.onSearchResultChange();
  //   }
  // }

  // get searchResult(): any {
  //   return this._searchResult;
  // }

  // private onSearchResultChange(): void {      
  //   console.log("inside2");
  //   console.log(this._searchResult);
  //   console.log(this.searchLoading);

  //   this.changeDetectorRef.detectChanges();
  //   console.log(this.searchLoading);

  //   if (this._searchResult && this.searchLoading) {
  //     console.log("inside");
  //     this.prepareMarketStatus();
  //     this.prepareNewsData();
  //     this.prepareHourlyData();
  //     this.prepareChartData();
  //     this.prepareInsightsData();
  //   }
  // }

  ngOnInit(): void {
    this.wishlistAlert.subscribe(message => {
      this.wishlistMessage = message;
    });

    this.tradeStockAlert.subscribe(message => {
      this.tradeStockMessage = message;
      setTimeout(() => this.tradeStockMessage = '', 5000);
    });

    this.subscribeToUpdateSignal();
  
  }

  subscribeToUpdateSignal() {
    this.updateSubscription = this.getUpdateSignal().subscribe(() => {
      if (this.companyProfile && !this.marketStatus) {
        this.checkMarketClose();    
        this.prepareTime();
        this.prepareHourlyData();
        console.log("Refreshing");
      }
    });
  }

  getUpdateSignal(): Observable<number> {
    // emit value at start and every 15 seconds
    return interval(15000).pipe(startWith(0));
  }

    ngOnChanges(changes: SimpleChanges) {
      console.log(!this.searchLoading);
      console.log(this.searchResult);
      console.log(this.currentMoney);
      if(this.searchResult == null) return;
      if (changes['searchResult']  && !changes['searchResult'].firstChange) {
        this.validateData();

        // if(!this.searchLoading){
        // }
        if (this.isError == false && this.searchResult && !this.searchLoading) {
          console.log("inside");
          console.log(this.marketStatus);
          this.checkMarketClose();    
          this.prepareTime();
          this.prepareNewsData();
          this.prepareHourlyData();
          this.prepareChartData();
          this.prepareInsightsData();  
        }
        this.checkFavoriteStatus();
        this.fetchCurrentStocks();
      }
    }

  checkMarketClose() {
            const currentTime = new Date().getTime();
            const timestampDate = new Date(this.searchResult.quote.t * 1000);
            console.log(this.searchResult.quote.t);
            const difference = (currentTime - timestampDate.getTime()) / (1000 * 60); // Difference in minutes
            this.marketStatus = difference >= 5; // Set marketClosed flag based on difference
            console.log(this.marketStatus);
        setInterval(() => {
            const currentTime = new Date().getTime();
            const timestampDate = new Date(this.searchResult.quote.t * 1000);
            console.log(this.searchResult.quote.t);
            const difference = (currentTime - timestampDate.getTime()) / (1000 * 60); // Difference in minutes
            this.marketStatus = difference >= 5; // Set marketClosed flag based on difference
            console.log(this.marketStatus);
          }, 5000);
  }

    private validateData(): void {
      this.isError = false;
      for (const key in this.searchResult) {
        console.log(key);
        if (this.searchResult.hasOwnProperty(key)) {
          console.log(this.searchResult[key]);
          if (this.searchResult[key] === null || this.searchResult[key] === undefined || this.searchResult[key].length === 0) {
            this.isError = true;
            console.error("Error: Property" + this.searchResult[key]);
            break;
          }
        }
      }   
    }

    private isEmpty(value: any): boolean {
      return (Array.isArray(value) && value.length === 0) || 
             (typeof value === 'object' && value !== null && Object.keys(value).length === 0);
    }
    
    // private validateData() {
    //   this.isError = false;
    //   if (this.searchResult) {
    //     for (let key in this.searchResult) {
    //       const value = this.searchResult[key];
    //       if (Array.isArray(value) && value.length === 0) {
    //         this.isError = true;
    //         console.log("Validate error")
    //         return;
    //       }
    //       if (typeof value === 'object' && Object.keys(value).length === 0) {
    //         this.isError = true;
    //         console.log("Validate error")
    //         return;
    //       }
    //     }
    //   }
    //   console.log("No validate error")
    // }

  prepareNewsData() {
    console.log(this.searchResult);
    const news = this.searchResult.news || [];
    this.newsData = news;
    //console.log("newsData " + this.searchResult.news);
  }

    prepareHourlyData() {
      const data = this.searchResult.hourData;
      console.log("hourly data: " + data);
      // market open: show stock price variation from yesterday to the today
      // market close: show stock price variation from one day before closing to the date when the market was closed.
      // get 32 data points for the chart
      const priceData: [number, number][] = [];
      for (let i = data.results.length-1; i >=0 ; i--){
        priceData.unshift([data.results[i].t, data.results[i].c]);
        if (priceData.length >= 32){
          break;
        }
      }
      if (this.searchResult.quote.d > 0){
        this.line = 'green';
      }
      else{
        this.line = 'red';
      }
      this.hourlyOptions = {
        colors: [this.line],
        rangeSelector: {
          enabled: false
        },
        navigator: {
          enabled: false
        },
        title: {
          text: data.ticker + ' Hourly Price Variation',
          style: {
            color: 'gray',
          },
        },
        xAxis: {
          type: 'datetime',
        },
        series: [{
          name: data.ticker,
          data: priceData,
          type: 'line',
        }],
        tooltip: {
          split: true,
        },
        time: {
          useUTC: false,
          timezone: 'America/Los_Angeles'
        },
        legend: {
          enabled: false
        },
        chart: {
          backgroundColor: '#f4f4f4',
        },
      };
        
    }

     // prepare chart data
  prepareChartData() {
    const data = this.searchResult.charts.results;
    const ohlc = [], volume = [], dataLength = data.length
    for (let i = 0; i < dataLength; i += 1) {
        ohlc.push([
            data[i].t, // the date
            data[i].o, // open
            data[i].h, // high
            data[i].l, // low
            data[i].c // close
        ]);

        volume.push([
            data[i].t, // the date
            data[i].v // the volume
        ]);
    }

    this.chartOptions = {
        rangeSelector: {
          buttons: [{
              'type': 'month',
              'count': 1,
              'text': '1m',
          }, {
              'type': 'month',
              'count': 3,
              'text': '3m',
          }, {
              'type': 'month',
              'count': 6,
              'text': '6m',
          }, {
              'type': 'ytd',  
              'text': 'YTD',
          }, {
              'type': 'year',
              'count': 1,
              'text': '1Y',
          }, {
              'type': 'all',
              'text': 'All',
          }],
          selected: 2, // set 6m as default
        },
        title: { text: this.searchResult.charts.ticker + ' Historical'},
        subtitle: { text: 'With SMA and Volume by Price technical indicators'},
        xAxis: {
          type: 'datetime'
        },
        yAxis: [{
          startOnTick: false,
          endOnTick: false,
          labels: {
              align: 'right',
              x: -3
          },
          title: {
              text: 'OHLC'
          },
          height: '60%',
          lineWidth: 2,
          resize: {
              enabled: true
          }
      }, {
          labels: {
              align: 'right',
              x: -3
          },
          title: {
              text: 'Volume'
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2
      }],
      tooltip: {
          split: true
      },
      chart: {
        backgroundColor: '#f4f4f4',
      },
      series: [{
          type: 'candlestick',
          name: this.searchResult.charts.ticker,
          id: this.searchResult.charts.ticker,
          zIndex: 2,
          data: ohlc
      }, {
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: volume,
          yAxis: 1
      }, {
          type: 'vbp',
          linkedTo: this.searchResult.charts.ticker,
          params: {
              volumeSeriesID: 'volume'
          },
          dataLabels: {
              enabled: false
          },
          zoneLines: {
              enabled: false
          }
      }, {
          type: 'sma',
          linkedTo: this.searchResult.charts.ticker,
          zIndex: 1,
          marker: {
              enabled: false
          }
      }],
      time: {
        useUTC: false,
        timezone: 'America/Los_Angeles'
      },
    }
  }

  prepareInsightsData(){
    let data = this.searchResult.sentiment.data;
    
    for (let i = 0; i < data.length; i++){
      this.totalMSPR += data[i].mspr;
      this.totalChange += data[i].change;
      if (data[i].mspr >= 0){
        this.positiveMSPR += data[i].mspr;
        this.positiveChange += data[i].change;
      }
      else{
        this.negativeMSPR += data[i].mspr;
        this.negativeChange += data[i].change;
      }
    }
    // recommend data
    data = this.searchResult.recommendation;
    let period = [], strongBuy = [], buy = [], hold = [], sell = [], strongSell = [];
    for (let i = 0; i < data.length; i++){
      let length = data[i].period.length;
      period.push(data[i].period.substring(0, length - 3));
      strongBuy.push(data[i].strongBuy);
      buy.push(data[i].buy);
      hold.push(data[i].hold);
      sell.push(data[i].sell);
      strongSell.push(data[i].strongSell); 
    }
    data = this.searchResult.recommend;
    this.recommendOptions = {
      chart:{
        type: 'column',
        backgroundColor: '#f4f4f4',
      },
      title: {
        text: 'Recommendation Trends'
      },
      xAxis: {
        categories: period,
        //crosshair: true
      },
      yAxis:{
        min: 0, 
        title:{
          text: '#Analysis'
        },
      },
      plotOptions: {
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: true
            }
        }
      },
      series: [{
        name: 'Strong Buy',
        data: strongBuy,
        type: 'column',
        color: 'darkgreen',
      },{
        name: 'Buy',
        data: buy,
        type: 'column',
        color: 'green',
      },{
        name: 'Hold',
        data: hold,
        type: 'column',
        color: '#B07E28',
      },{
        name: 'Sell',
        data: sell,
        type: 'column',
        color: 'red',
      },{
        name: 'Strong Sell',
        data: strongSell,
        type: 'column',
        color: 'darkred',
      }],
    }
    // surprise data
    data = this.searchResult.earnings;
    period = []
    let actual = [], estimate = [], surprise: Number[] = [];
    for (let i = 0; i < data.length; i++){
      period.push(data[i].period);
      actual.push(data[i].actual);
      estimate.push(data[i].estimate);
      surprise.push(data[i].surprise);
    }
    this.estimateOptions = {
      chart: {
        type: 'spline',
        backgroundColor: '#f4f4f4',
      },
      title: {
        text: 'Historical EPS Surprises'
      },
      xAxis: {
        categories: period,
        // showLastLabel: true,
        labels: {
          useHTML: true,
          formatter: function () {
            let surpriseValue = surprise[this.pos];
            return '<div style="text-align: center;">' + this.value + '<br><span>Surprise: ' + surpriseValue + '</span></div>';
          }
        }
      },
      yAxis: {
        title: {
          text: 'Quantity EPS'
        },
      },
      series: [{
        name: 'Actual',
        data: actual,
        type: 'spline',
      }, {
        name: 'Estimate',
        data: estimate,
        type: 'spline',
      }]
    }
  }
  onPeerClick(peer: string){
    this.peerClicked.emit(peer);
    this.router.navigate(['/search', peer]);
  }

    prepareTime(): any {
      console.log("inside market status");
        // if (this.hasFiveMinutesElapsed(this.searchResult.quote.t)) {
        //   this.marketStatus = false;
        // }
        // else {
        //   this.marketStatus = true;
        // }
        // console.log("market status" + this.marketStatus);

        this.prevTime = this.formatDateFromEpoch(this.searchResult.quote.t);
        this.currentTime = this.formattedCurrentDate();
        console.log(this.prevTime);
    }

   formatDateFromEpoch(epochTime: number): string {
    if (!epochTime) {
      return ''; // Handle potential undefined values
    }
    const date = new Date(epochTime * 1000); // Multiply by 1000 for milliseconds
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Pad month for single digits
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  formattedCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  hasFiveMinutesElapsed(epochTime: number): boolean {
    if (!epochTime) {
      return false; // Handle potential undefined values
    }
    const currentTime = new Date().getTime();
    const fiveMinutesInMilliseconds = 5 * 60 * 1000; // 5 minutes in milliseconds

    console.log(currentTime)
    console.log(epochTime)
    const timeDifference = currentTime - (epochTime * 1000); // Convert epoch to milliseconds first
  
    return timeDifference >= 5;
  }


  newsModal(newsItem: NewsData): void {
    this.dialog.open(NewsModalWindowComponent, {
      width: '500px', 
      data: { news: newsItem }
    });
  }

  // stockModal(sell: boolean) {
  //   this.stockModalService.stockModal(sell);
  // }

  stockModal(sell: boolean) {
    console.log("Money inside modal" + this.currentMoney);
      let tradeDialogRef = this.dialog.open(StockModalWindowComponent, {
        width: '400px',
        data: { 
          tickerSymbol: this.searchResult.profile.ticker,
          stockName: this.searchResult.profile.name, 
          purchase: sell,
          ownedQuantity: this.holdingQuantity,
          marketPrice: this.searchResult.quote.c,
          money: this.currentMoney
         }
      });

      // tradeDialogRef.afterClosed().pipe(
      //   tap(() => console.log('Trade dialog has been closed. Updating holdings and balance.'))
      // ).subscribe({
      //   next: () => this.updateFinancialData()
      // });
  
      tradeDialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed. Fetching updates.');
        this.updateFinancialData();
        if (result && result.success) {
          if (result.action === 'bought') {
            this.tradeStockAlert.next(this.searchResult.profile.ticker + " bought Successfully");
            this.alertTypeBuy = 'buy'; // Set your alert type for styling if needed
          } else if (result.action === 'sold') {
            this.tradeStockAlert.next(this.searchResult.profile.ticker + " sold Successfully");
            this.alertTypeBuy = 'sell'; // Set your alert type for styling if needed
          }
        }
      });
    }

    // initiateTradeProcess(buying: boolean): void {
    //   let tradeDialogRef = this.dialog.open(TradeModalComponent, {
    //     width: '400px',
    //     data: { 
    //       tickerSymbol: this.searchResult.profile.ticker, 
    //       purchasing: buying,
    //       marketPrice: this.searchResult.quote.c,
    //       ownedQuantity: this.holdingQuantity,
    //      }
    //   });
    
    //   tradeDialogRef.afterClosed().pipe(
    //     tap(() => console.log('Trade dialog has been closed. Updating holdings and balance.'))
    //   ).subscribe({
    //     next: () => this.updateFinancialData()
    //   });
    // }
    
    private updateFinancialData(): void {
      this.fetchCurrentStocks();
      this.calculateCurrentMoney();
    }

    // fetchHoldings() {
    //   this.apiService.getPortfolio().subscribe(holdings => {
    //     const holdingsArray = holdings as HoldingData[];
    //     this.isHolding = holdingsArray.some(holding => holding.ticker === this.searchResult.profile.ticker);
    //     this.holdingQuantity = holdingsArray.find(holding => holding.ticker === this.searchResult.profile.ticker)?.quantity || 0;
    //   })
    // }
    
    private calculateCurrentMoney(): void {
      // Logic to update current money
      // this.currentMoney = this.stateData.getCurrentMoney();
      this.apiService.getCurrentMoney().subscribe(result => {
        console.log("current money " + result[0].money);
        this.currentMoney = result[0].money;
      });
      console.log("Money from api: "+ this.currentMoney);
    }

    checkFavoriteStatus() {
      this.apiService.getWishlist().subscribe(favorites => {
        const favoritesArray = favorites as FavoriteData[];
        this.isFavorite = favoritesArray.some(favorite => favorite.ticker === this.searchResult.profile.ticker);
      });
    }

    updateWishlist(ticker: string, name?: string) {
      this.apiService.updateWishlist(ticker, name).subscribe(data => {
        console.log('update favorites', ticker, name)
      });
      this.isFavorite = !this.isFavorite;
      const message = this.isFavorite ? ticker + " added to Watchlist" : ticker + " removed from Watchlist";
      this.alertType = this.isFavorite ? 'add' : 'remove';
      this.wishlistAlert.next(message);
    
    // Set a timeout to clear the message after 5 seconds
      setTimeout(() => this.wishlistMessage = '', 5000);
      if(this.isFavorite) {
        this.showBanner = true;
      } else {
        this.showBanner = false;
      }
    }

    // this.wishlistAlert.subscribe(
    //   (message) => (this.starSuccessMessage = message)
    // );
    // this._StarAlertSuccess
    //   .pipe(debounceTime(5000))
    //   .subscribe(() => (this.starSuccessMessage = ''));


    fetchCurrentStocks() {
      console.log(this.searchResult.profile);
      this.apiService.getPortfolio().subscribe(holdings => {
        const holdingsArray = holdings as HoldingData[];
        this.isHolding = holdingsArray.some(holding => holding.ticker === this.searchResult.profile.ticker);
        this.holdingQuantity = holdingsArray.find(holding => holding.ticker === this.searchResult.profile.ticker)?.quantity || 0;
      })
    }
}
