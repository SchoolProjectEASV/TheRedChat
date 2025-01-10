import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * the FriendService is  responsible for managing friend relationships between users.
 * Provides methods for adding, removing, and retrieving friends.
 */

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private baseUrl = 'http://localhost:8080/api/friends';

  constructor(private http: HttpClient) {}

  addFriend(username: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/add`, { username }, {
      responseType: 'text'
    });
  }
  

  getFriends(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/list`);
  }

  removeFriend(friendUserId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/remove`, { body: { friendUserId } });
  }
}
