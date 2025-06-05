import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { MultiStepFormComponent } from './components/multi-step-form/multi-step-form.component';

const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'quote', component: MultiStepFormComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
