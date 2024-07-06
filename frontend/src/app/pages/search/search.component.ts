import { Component, Input, OnInit} from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { AutocompleteData} from '../../interfaces/autocomplete-data';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CompanyProfileComponent } from '../../components/company-profile/company-profile.component';
import { NavigationEnd, Router } from '@angular/router';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { StateDataService } from '../../services/state-data.service';
import { ApiService } from '../../services/api.service';
import { OpenStockModalService } from '../../services/open-stock-modal.service';
import { filter } from 'rxjs/operators';
import { TickerDataService } from '../../services/ticker-data.service';

interface StockDetails {
  profile: any; // Consider defining specific types for these anys
  hourly: any;
  history: any;
  quote: any;
  news: any;
  trends: any;
  insider: any;
  peers: any[];
  earnings: any;
}

@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  imports: [CommonModule, 
    MatAutocompleteModule, 
    FormsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    CompanyProfileComponent,
    NavBarComponent,
    FooterComponent,
  ]
})
export class SearchComponent implements OnInit {
  @Input() ticker: string = "";
  searchTicker: any;
  searchInput: string = "";
  searchResult: any;
  options: AutocompleteData[] = [];  
  autoLoading: boolean = false; // track autcomplete loading state
  searchLoading: boolean = false; // track search loading state
  companyProfile: boolean = false;
  searchChanged = new Subject<string>();
  marketStatus: boolean = true;
  prevTime: any;
  currentTime: any;
  isResult: boolean = true;

  constructor(private apiService: ApiService, 
              private activatedRoute: ActivatedRoute, 
              private router:Router,
              private stateData: StateDataService,
              private stockModalService: OpenStockModalService,
              private tickerService: TickerDataService) {
               // Accessing navigation state must be done with care for types
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state && navigation.extras.state.hasOwnProperty('ticker')) {
                this.ticker = navigation.extras.state['ticker'];
              }
              this.searchChanged.pipe(
                debounceTime(300)
              ).subscribe(ticker => {
                this.searchInput = ticker;
                this.fetchAutoCompleteResults(this.searchInput);
              });
              }

  ngOnInit(): void{

    this.tickerService.ticker$.subscribe(ticker => {
      if (ticker) {
        this.updateSearchBar(ticker);
      }
    });
    
    this.activatedRoute.paramMap.subscribe(params => {
      // 'ticker' should match the name of the parameter in your route configuration
      const tickerVal = params.get('ticker');
      if (tickerVal && tickerVal.toLowerCase() !== 'home') {
        this.companyProfile = false;
        this.searchLoading = true;
        this.fetchCompanyInformation(tickerVal);
        this.tickerService.setTicker(tickerVal);
        // this.fetchTickerDetails(ticker);
      } else {
        // Handle the 'home' case or initialize any default data as needed
        console.log('Home route accessed, not fetching ticker details.');
      }
    });
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const companyName = this.activatedRoute.snapshot.paramMap.get('ticker');
      if(companyName != 'home') {
        console.log(companyName);
        if (companyName) {
          this.updateSearchBar(companyName);
        }
      }
    });
    // this.activatedRoute.params.subscribe(params => {
    //   const ticker = params['ticker'];
    //   if (ticker) {
    //     this.companyProfile = false;
    //     this.searchLoading = true;
    //     this.fetchCompanyInformation(ticker);
    //   }
    // });
  }

  updateSearchBar(companyName: string) {
    console.log(this.ticker);
    this.ticker = companyName;
    console.log(this.ticker);
  }

  private timeout: any = null;
  // when search bar value changes, call API
  onSearchChange(event: any) {
    console.log("inside onsearchchnage");
    this.searchTicker = event.target.value;
    console.log(this.searchTicker);
    this.searchInput = this.searchTicker;
    this.searchChanged.next(event.target.value);
  }

  private fetchAutoCompleteResults(ticker: string): void {
    console.log("fetchandcomplete");
    // Only perform the search if there is a ticker
    if (ticker) {
      console.log(ticker);
      this.options = [];
      this.autoLoading = true;
      this.apiService.autoComplete(ticker).subscribe(response => {
        const autocompleteResponse = response as { count: number, result: AutocompleteData[] };
        autocompleteResponse.result = autocompleteResponse.result.filter((option) => option.type === "Common Stock" && !option.symbol.includes("."));
        this.options = autocompleteResponse.result;
        if(this.options.length > 0) this.isResult = true;
        else this.isResult = false;
        console.log(this.isResult);
        this.autoLoading = false;
      });
    } else {
      this.options = [];
    }
  }

  onOptionSelected(event: any): void {
    event.returnValue = false;
    const selectedValue = event.option.value;
    this.searchInput = selectedValue;
    this.router.navigate(['/search', selectedValue], { state: { ticker: selectedValue } });
  }

  // when user submits the form, call APIs
  onClick(event: any) {
    event.preventDefault();
    event.returnValue = false;
    console.log(this.ticker);
    if(this.ticker == "") {
      this.reset();
      this.isResult = false;
      return;
    } else {
    this.searchInput = this.ticker;
    this.tickerService.setTicker(this.ticker);
    this.router.navigate(['/search', this.searchInput]);
    }
    //this.router.navigate(['/search', searchInput], { state: { ticker: searchInput } });
  }

  // fetchCompanyInformation(ticker: string): void {
  //   const services = [
  //     this.apiService.fetchCompanyProfile.bind(this.apiService),
  //     this.apiService.fetchQuote.bind(this.apiService),
  //     this.apiService.fetchPeers.bind(this.apiService),
  //     this.apiService.fetchHourData.bind(this.apiService),
  //     this.apiService.fetchCharts.bind(this.apiService),
  //     this.apiService.fetchNews.bind(this.apiService),
  //     this.apiService.fetchRecommendation.bind(this.apiService),
  //     this.apiService.fetchSentiment.bind(this.apiService),
  //     this.apiService.fetchEarnings.bind(this.apiService),
  //   ];    

  //   console.log(services);
  
  //   forkJoin(services.map(service => service(ticker))).subscribe(results => {
  //     const [profile, quote, peers, hourData, charts, news, recommendation, sentiment, earnings] = results;
      
  //     //const refinedPeers = (peers as string[]).filter((peer: string) => !peer.includes('.'));

  //     const refinedPeers = Array.isArray(peers) ? peers.filter((peer: string) => !peer.includes('.')) : [];
      
  //     // Start preprocessing
  //     const preprocessedResults = this.preprocessResults({
  //       profile, quote, peers: refinedPeers, hourData, charts, news, recommendation, sentiment, earnings
  //     });

  //     console.log(preprocessedResults);
      
  //     // Handle the results
  //     this.handleResults(preprocessedResults, ticker);
  // });

  // }

  fetchCompanyInformation(ticker: string): void {
    // Array of functions to be called with the ticker as their argument
    const serviceCalls = [
      () => this.apiService.fetchCompanyProfile(ticker),
      () => this.apiService.fetchQuote(ticker),
      () => this.apiService.fetchPeers(ticker),
      () => this.apiService.fetchHourData(ticker),
      () => this.apiService.fetchCharts(ticker),
      () => this.apiService.fetchNews(ticker),
      () => this.apiService.fetchRecommendation(ticker),
      () => this.apiService.fetchSentiment(ticker),
      () => this.apiService.fetchEarnings(ticker),
    ];
  
    forkJoin(serviceCalls.map(call => call())).subscribe(results => {
      const [profile, quote, peers, hourData, charts, news, recommendation, sentiment, earnings] = results;
      const refinedPeers = Array.isArray(peers) ? peers.filter(peer => !peer.includes('.')) : [];
      
      // Start preprocessing
      const preprocessedResults = this.preprocessResults({
        profile, quote, peers: refinedPeers, hourData, charts, news, recommendation, sentiment, earnings
      });
      
      console.log(preprocessedResults);
      
      // Handle the results
      this.handleResults(preprocessedResults, ticker);
    });
  }
  
  preprocessResults(searchResult: any): any {
    console.log(searchResult.news);
    searchResult.news = this.prepareNewsData(searchResult.news);
    console.log(searchResult.news);
    //searchResult.marketStatus = this.prepareMarketStatus(searchResult.quote);  
    //console.log(searchResult.marketStatus);
    return searchResult;
  }
  
  prepareNewsData(news: any[]): any[] {
    // Process and filter news data here
    return news.filter(newsItem => newsItem.headline && newsItem.image).slice(0, 20);
  }
  
  prepareMarketStatus(quote: any): any {
    // Process quote to determine market status
    // Return an object or value that indicates market status
      if (this.hasFiveMinutesElapsed(quote.t)) {
        this.marketStatus = false;
      }
      else {
        this.marketStatus = true;
      }
      this.prevTime = this.formatDateFromEpoch(quote.t);
      this.currentTime = this.formattedCurrentDate();
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
    const timeDifference = currentTime - (epochTime * 1000); // Convert epoch to milliseconds first
  
    return timeDifference >= 5;
  }
  

  // fetchCompanyInformation(ticker: string): void {
  //   const services = [
  //     this.apiService.fetchCompanyProfile.bind(this.apiService),
  //     this.apiService.fetchQuote.bind(this.apiService),
  //     this.apiService.fetchPeers.bind(this.apiService),
  //     this.apiService.fetchHourData.bind(this.apiService),
  //     this.apiService.fetchCharts.bind(this.apiService),
  //     this.apiService.fetchNews.bind(this.apiService),
  //     this.apiService.fetchRecommendation.bind(this.apiService),
  //     this.apiService.fetchSentiment.bind(this.apiService),
  //     this.apiService.fetchEarnings.bind(this.apiService),
  //   ];    
  
  //   // Utilizing map to call each service function with the ticker.
  //   forkJoin(services.map(service => service(ticker))).subscribe(results => {
  //     const [profile, hourly, history, quote, news, trends, insider, peers, earnings] = results;
      
  //     const refinedPeers = (peers as string[]).filter((peer: string) => !peer.includes('.'));
  
  //     // Constructing the result object in a more dynamic way
  //     const searchResult = { profile, hourly, history, quote, news, trends, insider, peers: refinedPeers, earnings };
  
  //     // Handle the results
  //     this.handleResults(searchResult, ticker);
  //   });
  // }
  
  // Abstract the handling of results to its own method
  handleResults(searchResult: any, ticker: string): void {
    this.searchResult = searchResult;
    this.stockModalService.setSearchResult(searchResult);
    this.searchLoading = false;
    this.companyProfile = true;
    this.stateData.setLastSearchArg(ticker);
  }

  // reset
  reset() {
    console.log("Resetting search component");
    this.searchResult = null;
    this.options = [];
    this.companyProfile = false;
    this.searchInput = '';
    this.autoLoading = false;
    this.searchLoading = false;
    this.isResult = true;
    this.searchTicker="";
    this.ticker="";
    this.searchChanged.next("");
    this.stateData.clearLastSearch();
    this.tickerService.setTicker('');
    this.router.navigate(['/search']);
    this.fetchAutoCompleteResults('');
    this.updateSearchBar('');
  }
}
