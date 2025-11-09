import { User } from '../../src/domain/User.js';

export class UserMother {
  static umUsuarioPadrao() {
    return new User(
      1,
      "Usuário Padrão",
      "COMUM",
      "user@email.com"
    );
  }

  static umUsuarioPremium() {
    return new User(
      2,
      "Usuário Premium",
      "PREMIUM",
      "premium@email.com"
    );
  }
}