import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    NgbCollapse,
} from "@ng-bootstrap/ng-bootstrap";
import { MatTabsModule } from "@angular/material/tabs";
import { noDragging } from 'src/utils/noDragging';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { routes } from 'src/app/app.routes';
import { Subscription, filter } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
    selector: "navbar",
    standalone: true,
    templateUrl: "./navbar.component.html",
    styles: [],
    imports: [
        CommonModule,
        NgbCollapse,
        RouterLink,
        RouterLinkActive,
        MatTabsModule,
    ],
})
export class NavbarComponent implements OnInit, OnDestroy {
    protected isMenuCollapsed = true;
    protected appVersion = environment.appVersion;
    links = routes.map(route => route.path).filter(r => r != "" && r != "**"); //["Home", "Map", "Full Calendar", "Graphics"];
    activeLink = this.links[0];
    private navigation$: Subscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) {
        this.navigation$ = this.router.events
            .pipe(
                filter(
                    (event): event is NavigationEnd =>
                        event instanceof NavigationEnd
                )
            )
            .subscribe(ev =>
                this.activeLink = ev.urlAfterRedirects.substring(1)
            );
    }

    ngOnInit(): void {
        noDragging();
    }

    ngOnDestroy(): void {
        this.navigation$.unsubscribe();
    }

}
