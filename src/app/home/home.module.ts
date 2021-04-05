import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SortTablePipe } from '../sort-table.pipe';

const routes: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  declarations: [HomeComponent,SortTablePipe],
  imports: [
    CommonModule,FormsModule,HttpClientModule,NgxSpinnerModule,
    RouterModule.forChild(routes)
  ]
})
export class HomeModule { }
