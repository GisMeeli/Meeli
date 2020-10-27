import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxiCollaboratorComponent } from './taxi-collaborator.component';

describe('TaxiCollaboratorComponent', () => {
  let component: TaxiCollaboratorComponent;
  let fixture: ComponentFixture<TaxiCollaboratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxiCollaboratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxiCollaboratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
