import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MailComponent } from './mail/mail.component';
import { TaxiComponent } from './taxi/taxi.component';

const routes: Routes = [
  {path: '', redirectTo: 'mail', pathMatch: 'full'},
  {path: 'mail', component: MailComponent},
  {path: 'taxi', component: TaxiComponent},
  {path: '**', redirectTo: 'mail'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
