import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateDataService {


  private lastSearchArg: string = '';
  private lastSearchResult: any;
  private currentMoney: number = 25000.00;

  getLastSearchArg(): string {
    return this.lastSearchArg;
  }

  getCurrentMoney(): number {
    console.log(this.currentMoney);
    return this.currentMoney;
  }

  constructor() { }

  setLastSearchArg(arg: string): void {
    this.lastSearchArg = arg;
  }

  clearLastSearch(): void {
    this.lastSearchArg = '';
    this.lastSearchResult = null;
  }

  setCurrentMoney(money: number): void {
    this.currentMoney = money;
    console.log(this.currentMoney);
  }
}
