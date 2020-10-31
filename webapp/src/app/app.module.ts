import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { MapComponent } from './map/map.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateGroupComponent } from './create-group/create-group.component';
import { DialogService } from './services/dialog/dialog.service';
import { MailComponent } from './mail/mail.component';
import { TaxiComponent } from './taxi/taxi.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AdminGroupComponent } from './admin-group/admin-group.component';
import { ToastrModule } from 'ngx-toastr';
import { TaxiStatisticsComponent } from './taxi-statistics/taxi-statistics.component';
import { MailStatisticsComponent } from './mail-statistics/mail-statistics.component';




@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    CreateGroupComponent,
    MailComponent,
    TaxiComponent,
    AdminGroupComponent,
    TaxiStatisticsComponent,
    MailStatisticsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right'
    })
  ],
  entryComponents: [
    CreateGroupComponent
  ],
  providers: [DialogService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
