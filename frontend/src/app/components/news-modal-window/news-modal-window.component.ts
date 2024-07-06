import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { NewsData } from '../../interfaces/news-data'; 
import { MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { faXTwitter, faFacebook} from '@fortawesome/free-brands-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-news-modal-window',
  standalone: true,
  imports: [
    MatDialogModule,
    DatePipe,
    FaIconComponent
  ],
  templateUrl: './news-modal-window.component.html',
  styleUrl: './news-modal-window.component.css'
})
export class NewsModalWindowComponent {
  icon1 = faXTwitter;
  icon2 = faFacebook;

  constructor(
    public dialogRef: MatDialogRef<NewsModalWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { news: NewsData },
    library: FaIconLibrary,
    // public activeModal: NgbActiveModal
  ) {
    library.addIcons(faXTwitter);
  }

  // closeModal() {
  //   this.activeModal.dismiss();
  // }


  // shareOnTwitter(article: NewsData): void {
  //   const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.headline)}
  //   &url=${encodeURIComponent(article.url)}`;
  //   window.open(twitterUrl, '_blank');
  // }
  
  // shareOnFacebook(article: NewsData): void {
  //   const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.url)}`;
  //   window.open(facebookUrl, '_blank');
  // }

  onCloseClick(): void {
    this.dialogRef.close();
  }

}
