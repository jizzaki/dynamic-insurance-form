import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { ZooQuoteFormComponent } from './components/zoo-quote-form/zoo-quote-form.component';

const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'quote', component: ZooQuoteFormComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
