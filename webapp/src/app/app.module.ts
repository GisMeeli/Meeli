import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SidenavComponent } from './sidenav/sidenav.component';
import { MapComponent } from './map/map.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateGroupComponent } from './create-group/create-group.component';
import { DialogService } from './services/dialog/dialog.service';



@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
    MapComponent,
    CreateGroupComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RouterTestingModule,
    MaterialModule,
    FormsModule,
  ],
  entryComponents: [
    CreateGroupComponent
  ],
  providers: [DialogService],
  bootstrap: [AppComponent]
})
export class AppModule { }
