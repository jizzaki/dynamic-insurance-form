import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { StepFormComponent } from './components/step-form/step-form.component';

const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'quote', component: StepFormComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
