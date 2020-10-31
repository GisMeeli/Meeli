import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxiStatisticsComponent } from './taxi-statistics.component';

describe('TaxiStatisticsComponent', () => {
  let component: TaxiStatisticsComponent;
  let fixture: ComponentFixture<TaxiStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxiStatisticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxiStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
