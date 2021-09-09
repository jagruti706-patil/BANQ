import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiledistributionnotesComponent } from './filedistributionnotes.component';

describe('FiledistributionnotesComponent', () => {
  let component: FiledistributionnotesComponent;
  let fixture: ComponentFixture<FiledistributionnotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiledistributionnotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiledistributionnotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
