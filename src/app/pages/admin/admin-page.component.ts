import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ApiService } from '../../core/services/api.service';
import { UserRole, UserSummary } from '../../shared/models/user.model';
import { StoreSummary } from '../../shared/models/store.model';
import { Region } from '../../shared/models/region.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {
  stores: StoreSummary[] = [];
  users: UserSummary[] = [];
  regions: Region[] = [];
  readonly roles = Object.values(UserRole);

  readonly storeForm = this.fb.group({
    name: ['', Validators.required],
    location: ['', Validators.required],
    regionId: ['', Validators.required]
  });

  readonly userForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: [UserRole.StoreManager, Validators.required],
    regionId: [''],
    storeIds: [[] as string[]]
  });

  constructor(private readonly fb: FormBuilder, private readonly api: ApiService, private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadStores();
    this.loadUsers();
    this.loadRegions();
  }

  loadStores(): void {
    this.api.getStores().subscribe(stores => (this.stores = stores));
  }

  loadUsers(): void {
    this.http.get<UserSummary[]>(`${environment.apiUrl}/users`).subscribe(users => (this.users = users));
  }

  loadRegions(): void {
    this.api.getRegions().subscribe(regions => (this.regions = regions));
  }

  createStore(): void {
    if (this.storeForm.invalid) {
      this.storeForm.markAllAsTouched();
      return;
    }

    this.http.post(`${environment.apiUrl}/stores`, this.storeForm.value).subscribe(() => {
      this.storeForm.reset({ name: '', location: '', regionId: '' });
      this.loadStores();
    });
  }

  createUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.userForm.value,
      regionId: this.userForm.value.regionId || null,
      storeAssignments: (this.userForm.value.storeIds ?? []).filter(id => !!id)
    };

    this.http
      .post(`${environment.apiUrl}/users`, payload)
      .subscribe(() => {
        this.userForm.reset({
          fullName: '',
          email: '',
          password: '',
          role: UserRole.StoreManager,
          regionId: '',
          storeIds: []
        });
        this.loadUsers();
      });
  }
}
