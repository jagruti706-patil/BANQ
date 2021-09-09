import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubclientComponent } from './subclient.component';

describe('SubclientComponent', () => {
  let component: SubclientComponent;
  let fixture: ComponentFixture<SubclientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubclientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubclientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
