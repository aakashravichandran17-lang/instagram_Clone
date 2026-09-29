import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ExploreComponent } from './explore.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: ExploreComponent }
];

@NgModule({
  declarations: [ExploreComponent],
  imports: [CommonModule, FormsModule, SharedModule, RouterModule.forChild(routes)]
})
export class ExploreModule {}
