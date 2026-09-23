import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

export interface Session {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sessionSubject: BehaviorSubject<Session | null>;
  session$;

  constructor(private api: ApiService) {
    const token = this.api.obtenerToken();
    this.sessionSubject = new BehaviorSubject<Session | null>(token ? { token } : null);
    this.session$ = this.sessionSubject.asObservable();
  }

  get session(): Session | null {
    return this.sessionSubject.value;
  }

  async signIn(email: string, password: string): Promise<{ error: unknown }> {
    try {
      const data = await this.api.login(email, password);
      this.api.guardarToken(data.token);
      this.sessionSubject.next({ token: data.token });
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }

  signOut() {
    this.api.borrarToken();
    this.sessionSubject.next(null);
  }
}
