import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { alertController } from '@ionic/core';
import { Storage } from '@ionic/storage';
import { Participant } from 'src/app/interfaces/participant';
import { Session } from 'src/app/interfaces/session';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.page.html',
  styleUrls: ['./sessions.page.scss'],
})
export class SessionsPage implements OnInit {

  sessions: Session[] = [];
  participants: Participant[] = [];
  myInputs = [];

  constructor(public _toastController: ToastController, public storage: Storage) { }

  ngOnInit() {
    this.getSessions();
    this.getParticipants();
  }

   // Gets all participants already existent.
   private async getParticipants() {
    await this.storage.get("allParticipants").then((data) => {
      if (data != null) {
        data.forEach(participant => {
          this.participants.push(participant);
        });
        this.createInputs();
      }
    }, error => {
      this.displayToast("danger", "Erreur lors de la récupération des participants.");
      console.log(error);
    });
  }

  // Gets all sessions already existent.
  private async getSessions() {
    await this.storage.get("allSessions").then((data) => {
      if (data != null) {
        data.forEach(session => {
          this.sessions.push(session);
        });
      }
    }, error => {
      this.displayToast("danger", "Erreur lors de la récupération des sessions.");
      console.log(error);
    });
  }

  // Creates a new session.
  private async createSession(givensession: Session) {
    this.sessions.push(givensession);
    
    await this.storage.set("allSessions", this.sessions).then(data => {
      this.displayToast("success", "Le session " + givensession.name + " a bien été créé.");
    }, error => {
      this.displayToast("danger", "Erreur lors de la création de la session " + givensession.name + ".");
    });
  }

  // Adds participants to the givenSession.
  private async addParticipants(givenSession: Session, participants: Participant[]) {
    await this.storage.get("allSessions").then(data => {
      if (givenSession.participants == undefined)
        givenSession.participants = [];
        
      data.forEach(session => {
        if (session.name == givenSession.name && session.date == givenSession.date) {
          participants.forEach(currentParticipant => {
            givenSession.participants.push(currentParticipant);
          });

          this.storage.set("allSessions", this.sessions).then(() => {
            this.displayToast("success", "Les participants selectionnés ont bien été ajouté à la session " + session.name + ".");
          }, error => {
            this.displayToast("danger", "Erreur lors de l'ajout de participants pour la session " + session.name + ".");
          });
        }
      });
    });
  }

  // Edits the selectedsession.
  private async editSession(modifiedsession: Session, selectedsession: Session ) {
    this.sessions.forEach(session => {
      if (session.name == selectedsession.name && session.date == selectedsession.date) {
        session.name = modifiedsession.name;
        session.date = modifiedsession.date;
        
        this.storage.set("allSessions", this.sessions).then(() => {
          this.displayToast("success", "Le session " + session.name + " a bien été modifié.");
        }, error => {
          this.displayToast("danger", "Erreur lors de la modification de la session " + session.name + ".");
        });
      }
    });
  }

  // Deletes a given session.
  private async deleteSession(givensession: Session) {
    this.sessions.forEach(session => {
      if (session.name == givensession.name && session.date == givensession.date) {
        let index = this.sessions.indexOf(session);
        this.sessions.splice(index, 1);
        
        this.storage.set("allSessions", this.sessions).then(() => {
          this.displayToast("success", "Le session " + session.name + " a bien été supprimé.");
        }, error => {
          this.displayToast("danger", "Erreur lors de la suppression de la session " + session.name + ".");
        });
      }
    });
  }

  // Displays an alert.
  public async displayCreateSessionAlert() {
    const alert = await alertController.create({
      header: "Ajouter une session",
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Entrez un nom'
        },
        {
          name: 'date',
          type: 'date',
          placeholder: 'Entrez une date'
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        }, {
          text: 'Confirmer',
          handler: (response) => {
            if(response.date != "" && response.name != "") {
              this.createSession(response);
            }
            else
              this.displayToast("danger", "La date et/ou le nom n'a pas été précisé.");
          }
        }
      ]
    });

    alert.present();
  }

  // Displays an alert.
  public async displayEditSessionAlert(session: Session) {
    const alert = await alertController.create({
      header: "Modifier le session",
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: session.name,
          placeholder: 'Entrez un nom'
        },
        {
          name: 'date',
          type: 'date',
          value: session.date,
          placeholder: 'jj/mm/aaaa'
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        }, {
          text: 'Confirmer',
          handler: (response) => {
            if (response.date != "" && response.name != "") {
              this.editSession(response, session);
            } else {
              this.displayToast("danger", "La date et/ou le nom n'a pas été précisé.");
            }
          }
        }
      ]
    });

    alert.present();
  }

  // Creates inputs for displaying every participants.
  public async createInputs() {
    const theNewInputs = [];
    this.participants.forEach((participant, i) => {
      theNewInputs.push({
        type: 'checkbox',
        label: participant.name,
        value: '' + participant.name,
        checked: false
      });
    });
    
    this.myInputs = theNewInputs;
  }

  // Displays an alert.
  public async displayAddParticipantsAlert(session: Session) {
    const alert = await alertController.create({
      header: "Modifier la session",
      inputs: this.myInputs,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        }, {
          text: 'Confirmer',
          handler: (response: string) => {
            let selectedParticipants: Participant[] = [];
            this.participants.forEach(participant => {
              if (response.includes(participant.name))
                selectedParticipants.push(participant);
            });

            if (response) {
              this.addParticipants(session, selectedParticipants);
            } else {
              this.displayToast("danger", "La date et/ou le nom n'a pas été précisé.");
            }
          }
        }
      ]
    });

    alert.present();
  }

  // Displays an alert to confirm deleting a session.
  private async displayDeleteConfirmationAlert(headerText: string, messageText: string, givensession: Session) {
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
            this.deleteSession(givensession);
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
