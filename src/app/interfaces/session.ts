import { Participant } from "./participant";

export interface Session {
  name: string,
  date: Date,
  participants: Participant[]
}
