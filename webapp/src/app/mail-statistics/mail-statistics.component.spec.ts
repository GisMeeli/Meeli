import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailStatisticsComponent } from './mail-statistics.component';

describe('MailStatisticsComponent', () => {
  let component: MailStatisticsComponent;
  let fixture: ComponentFixture<MailStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MailStatisticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MailStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
