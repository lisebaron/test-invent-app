import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ToastController } from '@ionic/angular';
import { alertController } from '@ionic/core';
import { File } from 'src/app/interfaces/file';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public photos : File[] = [];
  public loading = true;

  constructor(public _toastController: ToastController) { }

  ngOnInit() {
    this.loadPhotos();
  }

  // Imports a photo and saves it in the filesystem.
  public async ImportPhoto() {
    const photo = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    }).catch((e) => {
      this.displayToast("danger", "Erreur lors de la récuperation de la photo.")
      console.log(e);
    });

    if (photo) {
      this.savePhoto(photo);
    }
  }

  // Saves a given photo in the filesystem.
  private async savePhoto(importedPhoto: Photo) {
    const fileName = new Date().getTime() + '.jpeg';

    const savedFile = await Filesystem.writeFile({
      directory: Directory.Data,
      path: 'stored-images/'+ fileName,
      data: importedPhoto.base64String
    }).then(response => {
      this.loading = true;
      this.displayToast("success", "Votre photo a bien été stocké.");
      this.loadPhotos();
    }, error => {
      this.loading = false;
      this.displayToast("danger", "Erreur lors du stockage de la photo.");
    });
  }

  // Loads all the saved photos.
  public async loadPhotos() {
    this.photos = [];

    Filesystem.readdir({
      directory: Directory.Data,
      path: 'stored-images/',
    }).then(result => {
      this.loadPhotosData(result.files)
    }, async error => {
      await Filesystem.mkdir({
        directory: Directory.Data,
        path: 'stored-images',
      });
    });
  }

  // Loads the saved photos' data.
  public async loadPhotosData(photoNames: string[]) {
    for (let photoName of photoNames) {
      const filePath = 'stored-images/'+ photoName;

      const readFile = await Filesystem.readFile({
        directory: Directory.Data,
        path: filePath
      });
      
      this.photos.unshift({
        name: photoName,
        path: filePath,
        data: 'data:image/jpeg;base64,' + readFile.data
      });
    }
    
    this.loading = false;
  }

  // Deletes a given saved photo.
  public async deletePhoto(photo: any) {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: photo.path,
    }).then(() => {
      this.loadPhotos();
      this.displayToast("success", "Suppression réussie.");
    }, error => {
      this.displayToast("medium", "Suppression annulée.");
    });
  }

  // Displays a toast.
  private async displayToast(color: string, displayedText: string) {
    const toast = await this._toastController.create({
      message: displayedText,
      duration: 3000,
      position: 'bottom',
      color: color
    });

    toast.present();
  }

  // Displays an alert.
  private async displayDeletePhotoAlert(headerText: string, messageText: string, photo: any) {
    const alert = await alertController.create({
      header: headerText,
      message: messageText,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        }, {
          text: 'Confirmer',
          handler: () => {
            this.deletePhoto(photo);
          }
        }
      ]
    });

    alert.present();
  }

}