// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class ApiService {

//   host: string = 'http://localhost:3000';

//   constructor(private httpClient: HttpClient) { }

//   private getWithParams(endpoint: string, params: HttpParams) {
//     return this.httpClient.get<any>(`${this.host}${endpoint}`, { params });
//   }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  // private readonly baseUrl = 'http://localhost:8080';
  private readonly baseUrl = '';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  private fetchFromApi(endpoint: string, ticker?: string): Observable<any> {
    const url = ticker ? `${this.baseUrl}${endpoint}?ticker=${ticker}` : `${this.baseUrl}${endpoint}`;
    return this.http.get(url).pipe(catchError(this.handleError));
  }

  // autoComplete(query: string): Observable<any> {
  //   return this.fetchFromApi(`/api/autofill/${query}`);
  // }

  fetchCompanyProfile(ticker: string) {
    return this.fetchFromApi('/api/company-profile', ticker);
  }

  fetchHourData(ticker: string) {
    return this.fetchFromApi('/api/hourData', ticker);
  }

  fetchCharts(ticker: string) {
    return this.fetchFromApi('/api/charts', ticker);
  }

  fetchQuote(ticker: string) {
    return this.fetchFromApi('/api/quote', ticker);
  }

  fetchNews(ticker: string) {
    return this.fetchFromApi('/api/news', ticker);
  }

  fetchRecommendation(ticker: string) {
    return this.fetchFromApi('/api/recommendation', ticker);
  }

  fetchSentiment(ticker: string) {
    return this.fetchFromApi('/api/sentiment', ticker);
  }

  fetchPeers(ticker: string) {
    return this.fetchFromApi('/api/peers', ticker);
  }

  fetchEarnings(ticker: string) {
    return this.fetchFromApi('/api/earnings', ticker);
  }

  getWishlist() {
    return this.fetchFromApi('/wishlist');
  }
  
  getPortfolio() {
    return this.fetchFromApi('/holdings');
  }

    private fetchFromApiAutocomplete(endpoint: string, ticker: string, isPathParam: boolean = false): Observable<any> {
    const url = isPathParam ? `${this.baseUrl}${endpoint}/${ticker}` : `${this.baseUrl}${endpoint}`;
    let params = new HttpParams();
    if (!isPathParam) {
      params = params.set('ticker', ticker);
    }
    return this.http.get(url, { params });
  }

    autoComplete(query: string): Observable<any> {
    return this.fetchFromApiAutocomplete('/api/autofill', query, true);
  }

  updateWishlist(ticker: string, name?: string) {
    const url = `${this.baseUrl}/wishlist`;
    return this.http.post(url, { ticker: ticker, name: name })
      .pipe(
        catchError(this.handleError)
      );
  }

  updatePortoflio(ticker: string, quantity: number, cost: number) {
    const url = `${this.baseUrl}/holdings`; 
    return this.http.post(url, { ticker: ticker, quantity: quantity, cost: cost })
      .pipe(
        catchError(this.handleError)
      );
  }

  getCurrentMoney() {
    return this.fetchFromApi('/money');
  }

  updateCurrentMoney(money: number) {
    const url = `${this.baseUrl}/money`;
    return this.http.post(url, { money:money })
    .pipe(
      catchError(this.handleError)
    );
  }
}



