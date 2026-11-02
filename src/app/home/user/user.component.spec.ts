import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';
import { UsersRepoService } from "src/infrastructure/repositories/users-repo.service";
import { of } from "rxjs";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(async () => {
      const repoMock = jasmine.createSpyObj<UsersRepoService>(
          "UsersRepoService",
          ["getUsers"],
      );

      repoMock.getUsers.and.returnValue(
          of({
              status: 200,
              message: "OK",
              data: [],
          }),
      );

      await TestBed.configureTestingModule({
          imports: [UserComponent, NoopAnimationsModule],
          providers: [
              { provide: UsersRepoService, useValue: repoMock },
              {
                  provide: MatDialogRef,
                  useValue: {
                      close: jasmine.createSpy("close"),
                  },
              },
              {
                  provide: MAT_DIALOG_DATA,
                  useValue: {
                      position: 0,
                      user: {
                          _id: "",
                          updatedAt: "",
                          createdAt: "",
                          __v: "",
                          email: "",
                          firstName: "",
                          lastName: "",
                          password: "",
                          role: "default",
                      },
                      action: "Add",
                  },
              },
          ],
      }).compileComponents();

      fixture = TestBed.createComponent(UserComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
