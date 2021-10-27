import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { alertController } from '@ionic/core';
import { Participant } from 'src/app/interfaces/participant';
import { Storage } from '@ionic/storage';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-participants',
  templateUrl: './participants.page.html',
  styleUrls: ['./participants.page.scss'],
})
export class ParticipantsPage implements OnInit {

  participants: Participant[] = [];

  constructor(public _toastController: ToastController, public storage: Storage) {
  }

  ngOnInit() {
    this.getParticipants();
  }

  // Gets all participants already existent.
  private async getParticipants() {
    await this.storage.get("allParticipants").then((data) => {
      if (data != null) {
        data.forEach(participant => {
          this.participants.push(participant);
        });
      }
    }, error => {
      this.displayToast("danger", "Erreur lors de la récupération des participants.");
      console.log(error);
    })
  }

  // Creates a new participant.
  private async createParticipant(givenParticipant: Participant) {
    this.participants.push(givenParticipant);
    
    await this.storage.set("allParticipants", this.participants).then(data => {
      this.displayToast("success", "Le participant " + givenParticipant.name + " a bien été créé.");
    }, error => {
      this.displayToast("danger", "Erreur lors de la création du participant " + givenParticipant.name + ".");
    });
  }

  private async editParticipant(modifiedParticipant: Participant, selectedParticipant: Participant ) {
    this.participants.forEach(participant => {
      if (participant.name == selectedParticipant.name && participant.email == selectedParticipant.email) {
        participant.name = modifiedParticipant.name;
        participant.email = modifiedParticipant.email;

        
        // let index = this.participants.indexOf(participant);
        // this.participants.splice(index, 1);
        
        this.storage.set("allParticipants", this.participants).then(() => {
          this.displayToast("success", "Le participant " + participant.name + " a bien été modifié.");
        }, error => {
          this.displayToast("danger", "Erreur lors de la modification du participant " + participant.name + ".");
        });
      }
    });
  }

  // Deletes a given participant.
  private async deleteParticipant(givenParticipant: Participant) {
    this.participants.forEach(participant => {
      if (participant.name == givenParticipant.name && participant.email == givenParticipant.email) {
        let index = this.participants.indexOf(participant);
        this.participants.splice(index, 1);
        
        this.storage.set("allParticipants", this.participants).then(() => {
          this.displayToast("success", "Le participant " + participant.name + " a bien été supprimé.");
        }, error => {
          this.displayToast("danger", "Erreur lors de la suppression du participant " + participant.name + ".");
        });
      }
    });
  }

  // Displays an alert.
  public async displayCreateParticipantAlert() {
    const alert = await alertController.create({
      header: "Ajouter un Participant",
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Entrez un nom'
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Entrez un email'
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        }, {
          text: 'Confirmer',
          handler: (response) => {
            if(response.email != "" && response.name != "") {
              this.createParticipant(response);
            }
            else
              this.displayToast("danger", "L'email et/ou le nom n'a pas été précisé.")
          }
        }
      ]
    });

    alert.present();
  }

  // Displays an alert.
  public async displayEditParticipantAlert(participant: Participant) {
    const alert = await alertController.create({
      header: "Modifier le participant",
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: participant.name,
          placeholder: 'Entrez un nom'
        },
        {
          name: 'email',
          type: 'email',
          value: participant.email,
          placeholder: 'Entrez un email'
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        }, {
          text: 'Confirmer',
          handler: (response) => {
            if(response.email != "" && response.name != "") {
              this.editParticipant(response, participant);
            }
            else
              this.displayToast("danger", "L'email et/ou le nom n'a pas été précisé.")
          }
        }
      ]
    });

    alert.present();
  }

  // Displays an alert.
  private async displayDeleteConfirmationAlert(headerText: string, messageText: string, givenparticipant: Participant) {
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
            this.deleteParticipant(givenparticipant);
          }
        }
      ]
    });

    alert.present();
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
}
