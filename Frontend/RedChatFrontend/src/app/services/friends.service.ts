import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private baseUrl = 'http://localhost:8080/api/friends';

  constructor(private http: HttpClient) {}

  addFriend(friendUserId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, { friendUserId });
  }

  getFriends(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/list`);
  }

  removeFriend(friendUserId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/remove`, { body: { friendUserId } });
  }
}
