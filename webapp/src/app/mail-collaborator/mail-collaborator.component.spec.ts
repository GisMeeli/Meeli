import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailCollaboratorComponent } from './mail-collaborator.component';

describe('MailCollaboratorComponent', () => {
  let component: MailCollaboratorComponent;
  let fixture: ComponentFixture<MailCollaboratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MailCollaboratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MailCollaboratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
