import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MatDialogModule  } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { StateDataService } from '../../services/state-data.service';

@Component({
  selector: 'app-stock-modal-window',
  standalone: true,
  imports: [ CommonModule,
    MatFormField,
    MatDialogModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    NgIf,],
  templateUrl: './stock-modal-window.component.html',
  styleUrl: './stock-modal-window.component.css'
})


export class StockModalWindowComponent {
  tradeQuantity = 0;
  stockTicker = '';
  isBuying = false;
  currentPrice: number = 0;
  currentMoney: any;
  totalCost: number = 0;
  moneyNotEnough: boolean = false;
  stockNotEnough: boolean = false;
  holdingQuantity: number = 0;
  stockName: string = '';

  constructor(
    public stockModal: MatDialogRef<StockModalWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiCall: ApiService,
    private stateData: StateDataService
  ) { 
    console.log(data);
    this.stockTicker = data.tickerSymbol;
    this.isBuying = data.purchase;
    this.currentPrice = data.marketPrice;
    this.currentMoney = data.money;
    this.holdingQuantity = data.ownedQuantity;
    this.stockName = data.stockName;
    console.log(this.currentMoney);
  }

  onQuantityChange(newQuantity: number): void {
    this.tradeQuantity = newQuantity;
    this.totalCost = this.tradeQuantity * this.currentPrice;
    this.moneyNotEnough = this.currentMoney < this.totalCost;
    this.stockNotEnough = this.tradeQuantity > this.holdingQuantity;
  }
  
  onCloseClick(): void {
    this.stockModal.close();
  }

  onBuySell(): void {
    if(this.isBuying) {
      this.apiCall.updatePortoflio(this.stockTicker, this.tradeQuantity, this.currentPrice * this.tradeQuantity)
      .subscribe({
        next: (result) => {
          console.log("BOUGHT ", result);
          // this.stateData.setCurrentMoney(this.currentMoney - this.currentPrice * this.tradeQuantity);
          this.apiCall.updateCurrentMoney(this.currentMoney - this.currentPrice * this.tradeQuantity).subscribe({});
          this.stockModal.close({ action: 'bought', success: true });
        },
        error: (error) => {
          console.error("Buy failed", error);
        }
      });
    } else {
      this.apiCall.updatePortoflio(this.stockTicker, -this.tradeQuantity, this.currentPrice * this.tradeQuantity * -1)
        .subscribe({
          next: (result) => {
            console.log("SOLD: ", result);
            // this.stateData.setCurrentMoney(this.currentMoney + this.currentPrice * this.tradeQuantity);
            this.apiCall.updateCurrentMoney(this.currentMoney + this.currentPrice * this.tradeQuantity).subscribe({});
            this.stockModal.close({ action: 'sold', success: true });
          },
          error: (error) => {
            console.error("SELL Failed: ", error);
          }
        });
    }

  }

  getMoney(): any {
    this.apiCall.getCurrentMoney().subscribe(result => {
      console.log(result[0].money);
      return result[0].money;
    });
  }

  // You could use this method to close the modal dialog and optionally pass data back to the opener
  // closeDialog(): void {
  //   // If you need to send data back
  //   this.stockModal.close(/* here you can pass any data back to the opener */);
    
  //   // If you don't need to pass data back, just close the dialog
  //   // this.dialogRef.close();
  // }

  // // Additional methods for handling the trade operation
  // executeTrade(): void {
  //   // Implement your trade execution logic here
  //   // This could include form validation and sending a request to a backend service

  //   // After trade execution, close the dialog
  //   this.stockModal.close();
  }

