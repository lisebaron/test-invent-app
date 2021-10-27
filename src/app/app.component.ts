import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/pages/home', icon: 'home' },
    { title: 'Participants', url: 'pages/participants', icon: 'person' },
    { title: 'Sessions', url: 'pages/sessions', icon: 'calendar' },
  ];

  constructor(private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create();
  }
}
