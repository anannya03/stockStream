import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TickerDataService {
  private tickerSource = new BehaviorSubject<string>('');

  // Observable ticker stream
  ticker$ = this.tickerSource.asObservable();

  constructor() { }

  setTicker(ticker: string) {
    this.tickerSource.next(ticker);
  }
}
