import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectsubclientComponent } from './selectsubclient.component';

describe('SelectsubclientComponent', () => {
  let component: SelectsubclientComponent;
  let fixture: ComponentFixture<SelectsubclientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectsubclientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectsubclientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
