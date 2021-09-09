import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileclaimdetailsComponent } from './fileclaimdetails.component';

describe('FileclaimdetailsComponent', () => {
  let component: FileclaimdetailsComponent;
  let fixture: ComponentFixture<FileclaimdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileclaimdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileclaimdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
