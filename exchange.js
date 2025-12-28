<nav>
  <ul class="nav-menu">
    <div class="nav-menu__wrap-items"
         *ngIf="authUser">
      <li class="nav-menu__item"
          routerLinkActive="active">
        <a routerLink="/recipes">All recipes</a>
      </li>
      <li class="nav-menu__item"
          routerLinkActive="active">
        <a routerLink="/recipe/add">Add recipe</a>
      </li>
      <li class="nav-menu__item"
          routerLinkActive="active">
        <a [routerLink]="['/profile', authUser.id]">User profile</a>
      </li>
    </div>
    <div class="nav-menu__wrap-items"
         *ngIf="authUser && authUser?.isAdmin">
      <li class="nav-menu__item"
          routerLinkActive="active">
        <a [routerLink]="['/admin/recipes']">Recipes</a>
      </li>
      <li class="nav-menu__item"
          routerLinkActive="active">
        <a [routerLink]="['/admin/users']">Users</a>
      </li>
    </div>
    <div *ngIf="!authUser"
         class="nav-menu__wrap-items">
      <li class="nav-menu__item"
          routerLinkActive="active">
        <a routerLink="/login">Login</a>
      </li>
      <li class="nav-menu__item"
          routerLinkActive="active">
        <a routerLink="/register">Register</a>
      </li>
    </div>
    <div *ngIf="authUser"
         class="nav-menu__wrap-items">
      <li class="nav-menu__item">
        <a (click)="logout()">Logout</a>
      </li>
    </div>
  </ul>
</nav>
