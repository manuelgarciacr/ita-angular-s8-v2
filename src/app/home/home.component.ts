import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule, Sort } from "@angular/material/sort";
import { UsersRepoService } from "src/infrastructure/repositories/users-repo.service";
import { IUser, ROLES } from "src/domain/model/IUser";
import { UserComponent } from "src/app/home/user/user.component";
import {
    MatDialog,
    MatDialogModule,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { ExcelService, cellSchema } from "src/domain/services/excel.service";
import { Row } from "write-excel-file";


interface Element extends IUser {
    position: number;
}

@Component({
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatButtonModule,
        MatDialogModule,
        MatPaginatorModule,
    ],
    templateUrl: "home.component.html",
    styleUrls: ["home.component.scss"],
})
export class HomeComponent implements OnInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    protected displayedColumns: string[] = [
        "position",
        "firstName",
        "lastName",
        "email",
        "password",
        "role",
        "actions",
    ];
    protected dataSource = new MatTableDataSource<Element>();
    protected roles = ROLES;
    private schema: cellSchema<IUser>[] = [
        {
            key: "firstName",
            column: "First name",
            value: user => user.firstName
        },
        {
            key: "lastName",
            column: "Last name",
            value: user => user.lastName
        },
        {
            key: "email",
            column: "Email",
            value: user => user.email
        },
        {
            key: "role",
            column: "Role",
            value: user => this.roles.find(r => r.value == user.role)?.viewValue ?? user.role
        }
    ]

    constructor(
        private repo: UsersRepoService,
        private excel: ExcelService,
        private dialog: MatDialog,
        private _liveAnnouncer: LiveAnnouncer
    ) {}

    ngOnInit(): void {
        this.repo.getUsers().subscribe(
            users =>
                (this.dataSource.data = users.data.map((user, i) => ({
                    position: i + 1,
                    ...user,
                })))
        );
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    // Edit and Delete
    actualize(element: Element, action: string): void {
        const { position, ...user } = element;
        this.dialog
            .open(UserComponent, {
                enterAnimationDuration: "1000ms",
                exitAnimationDuration: "500ms",
                panelClass: "my-outlined-dialog",
                data: { position, user, action },
            })
            .afterClosed()
            .subscribe(() => {
                this.ngOnInit();
            });
    }

    add(): void {
        this.dialog
            .open(UserComponent, {
                enterAnimationDuration: "1000ms",
                exitAnimationDuration: "500ms",
                panelClass: "my-outlined-dialog",
                data: {
                    position: 0,
                    user: {
                        email: "",
                        firstName: "",
                        lastName: "",
                        password: "",
                    } as IUser,
                    action: "Add",
                },
            })
            .afterClosed()
            .subscribe(() => {
                this.ngOnInit();
            });
    }

    exportXls = ()=>{
        this.excel.createExcel(this.dataSource.data as unknown as Row[], this.schema, "users.xlsx")
    }

    /** Announce the change in sort state for assistive technology. */
    announceSortChange(sortState: Sort) {
        console.log("ANNOUN", sortState);
        if (sortState.direction) {
            this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
        } else {
            this._liveAnnouncer.announce("Sorting cleared");
        }
    }

    protected getRole = (k: string) => this.roles.find(v => v.value == k)?.viewValue;

}
