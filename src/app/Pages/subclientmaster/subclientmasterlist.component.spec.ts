import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubclientmasterlistComponent } from './subclientmasterlist.component';

describe('SubclientmasterlistComponent', () => {
  let component: SubclientmasterlistComponent;
  let fixture: ComponentFixture<SubclientmasterlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubclientmasterlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubclientmasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
