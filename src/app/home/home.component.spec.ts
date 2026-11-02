import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Row } from "write-excel-file";
import { HomeComponent } from "./home.component";
import { UsersRepoService } from "src/infrastructure/repositories/users-repo.service";
import { ExcelService } from "src/domain/services/excel.service";
import { IUser } from "src/domain/model/IUser";

describe("HomeComponent", () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    let repo: jasmine.SpyObj<UsersRepoService>;
    let excel: jasmine.SpyObj<ExcelService>;
    let dialogMock: jasmine.SpyObj<MatDialog>;
    let announcer: jasmine.SpyObj<LiveAnnouncer>;

    const users = [
        {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "secret",
            role: "admin",
        },
        {
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            password: "secret",
            role: "user",
        },
    ] as IUser[];

    beforeEach(async () => {
        repo = jasmine.createSpyObj<UsersRepoService>("UsersRepoService", [
            "getUsers",
        ]);
        excel = jasmine.createSpyObj<ExcelService>("ExcelService", [
            "createExcel",
        ]);
        announcer = jasmine.createSpyObj<LiveAnnouncer>("LiveAnnouncer", [
            "announce",
        ]);
        dialogMock = jasmine.createSpyObj<MatDialog>("MatDialog", ["open"]);

        repo.getUsers.and.returnValue(
            of({
                status: 200,
                message: "OK",
                data: users,
            }),
        );

        dialogMock.open.and.returnValue({
            afterClosed: () => of(null),
        } as any);

        await TestBed.configureTestingModule({
            imports: [HomeComponent],
            providers: [
                { provide: UsersRepoService, useValue: repo },
                { provide: ExcelService, useValue: excel },
                { provide: LiveAnnouncer, useValue: announcer },
            ],
        })
            .overrideComponent(HomeComponent, {
                add: {
                    providers: [{ provide: MatDialog, useValue: dialogMock }],
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;

        expect(fixture.debugElement.injector.get(MatDialog)).toBe(dialogMock);
    });

    it("should create the component", () => {
        expect(component).toBeTruthy();
    });

    it("should load users and assign their positions", () => {
        component.ngOnInit();

        expect(repo.getUsers).toHaveBeenCalled();
        expect(component["dataSource"].data.length).toBe(2);
        expect(component["dataSource"].data[0].position).toBe(1);
        expect(component["dataSource"].data[1].position).toBe(2);
        expect(component["dataSource"].data[0].firstName).toBe("John");
    });

    it("should open the edit dialog with the selected user", () => {
        const element = {
            ...users[0],
            position: 1,
        };

        component.actualize(element, "Edit");

        expect(dialogMock.open).toHaveBeenCalled();

        const dialogData = dialogMock.open.calls.mostRecent().args[1]?.data as {
            position: number;
            user: IUser;
            action: string;
        };

        expect(dialogData.position).toBe(1);
        expect(dialogData.user.email).toBe("john@example.com");
        expect(dialogData.action).toBe("Edit");
    });

    it("should reload users after closing the edit dialog", () => {
        component.actualize({ ...users[0], position: 1 }, "Edit");

        expect(repo.getUsers).toHaveBeenCalled();
    });

    it("should open the add dialog with an empty user", () => {
        component.add();

        expect(dialogMock.open).toHaveBeenCalled();

        const dialogData = dialogMock.open.calls.mostRecent().args[1]?.data as {
            position: number;
            user: IUser;
            action: string;
        };;

        expect(dialogData.position).toBe(0);
        expect(dialogData.action).toBe("Add");
        expect(dialogData.user.email).toBe("");
        expect(dialogData.user.firstName).toBe("");
        expect(dialogData.user.lastName).toBe("");
    });

    it("should reload users after closing the add dialog", () => {
        component.add();

        expect(repo.getUsers).toHaveBeenCalled();
    });

    it("should export the users to Excel", () => {
        component.ngOnInit();
        component.exportXls();

        expect(excel.createExcel).toHaveBeenCalled();

        const args = excel.createExcel.calls.mostRecent().args;

        expect(args[0]).toEqual(
            component["dataSource"].data as unknown as Row[],
        );
        expect(args[1]).toEqual(jasmine.any(Array));
        expect(args[2]).toBe("users.xlsx");
    });

    it("should announce ascending sort", () => {
        component.announceSortChange({
            active: "firstName",
            direction: "asc",
        });

        expect(announcer.announce).toHaveBeenCalledWith("Sorted ascending");
    });

    it("should announce descending sort", () => {
        component.announceSortChange({
            active: "firstName",
            direction: "desc",
        });

        expect(announcer.announce).toHaveBeenCalledWith("Sorted descending");
    });

    it("should announce when sorting is cleared", () => {
        component.announceSortChange({
            active: "firstName",
            direction: "",
        });

        expect(announcer.announce).toHaveBeenCalledWith("Sorting cleared");
    });

    it("should return the display value of a role", () => {
        const role = component["roles"][0];

        expect(component["getRole"](role.value)).toBe(role.viewValue);
    });
});
