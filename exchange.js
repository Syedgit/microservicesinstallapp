Review the highlighted code blocks in the source code and select 1 code block that causes the vulnerability listed below.


html

<div>
  <table mat-table
         [dataSource]="recipes"
         class="mat-elevation-z8 table">

    <ng-container matColumnDef="wholeElement">
      <th mat-header-cell
          *matHeaderCellDef> Whole Element </th>
      <td mat-cell
          *matCellDef="let element"> {{element}} </td>
    </ng-container>

    <ng-container matColumnDef="action">
      <th mat-header-cell
          *matHeaderCellDef> Action </th>
      <td mat-cell
          *matCellDef="let element">
        <button type="button"
                mat-stroked-button
                color="warn"
                (click)="deleteRecipe(element.id)">Delete</button>
        <button type="button"
                mat-stroked-button
                color="primary"
                [routerLink]="['/recipe', element.id]">Details</button>
      </td>
    </ng-container>

    <tr mat-header-row
        *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row
        *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>
</div>

component

Accessibility information
This page has four areas: Information about the challenge, a tree view “File Explorer” containing the project files, a “Code blocks” section with a list of code blocks that can be chosen as answers to be submitted, and a code viewer section. The code viewer section has tabs displaying opened files, with the currently opened file presented in a table. This table has three columns: Code block indicator (only present on the first line of a code block) which can be used to select the code block as an answer, line number, and the code itself. Each line of code within a code block is prefixed with ‘CBX’, where X is a number used to distinguish between code blocks. Opening category information or pressing the hints or submit buttons will open a modal dialog.

Skip to Code Editor
Locate the vulnerability
Fix the vulnerability
Locate the vulnerability
Review the highlighted code blocks in the source code and select 1 code block that causes the vulnerability listed below.

Vulnerability Category
Information Exposure - Sensitive Data Exposure

Actions
1/1 code block(s) selected

Attempts left: 1

View shortcuts keyboard hotkey:?

File Explorer
Highlighted files only: 67 files hidden


src4 code blocks left, 0 code blocks ignored
app4 code blocks left, 0 code blocks ignored
components4 code blocks left, 0 code blocks ignored
recipes-list4 code blocks left, 0 code blocks ignored
recipes-list.component.html3 code blocks left, 0 code blocks ignored
3
recipes-list.component.ts1 code blocks left, 0 code blocks ignored
1
Code blocks
recipes-list.component.html:6-12
recipes-list.component.html:21-21
recipes-list.component.html:25-25
recipes-list.component.ts:26-30
Code block 2 selected
import { Component, OnInit } from '@angular/core';
import { IRecipe } from 'src/app/interfaces/recipe.interface';
import { RecipesService } from 'src/app/services/recipes.service';

@Component({
  selector: 'app-recipes-list',
  templateUrl: './recipes-list.component.html',
  styleUrls: ['./recipes-list.component.scss'],
})
export class RecipesListComponent implements OnInit {
  recipes: Array<IRecipe> = [];
  displayedColumns: string[] = ['wholeElement', 'action'];

  constructor(private recipesService: RecipesService) {}

  ngOnInit(): void {
    this.getAllRecipes();
  }

  getAllRecipes() {
    this.recipesService.getAllRecipes().subscribe((data: Array<IRecipe>) => {
      this.recipes = data;
    });
  }

  deleteRecipe(id: string) {
    this.recipesService.deleteRecipe(id).subscribe(() => {
      this.getAllRecipes();
    });
  }
}
