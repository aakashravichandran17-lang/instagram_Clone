import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: SettingsComponent }
];

@NgModule({
  declarations: [SettingsComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RouterModule.forChild(routes)]
})
export class SettingsModule {}
