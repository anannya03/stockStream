import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockModalWindowComponent } from './stock-modal-window.component';

describe('StockModalWindowComponent', () => {
  let component: StockModalWindowComponent;
  let fixture: ComponentFixture<StockModalWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockModalWindowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockModalWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
