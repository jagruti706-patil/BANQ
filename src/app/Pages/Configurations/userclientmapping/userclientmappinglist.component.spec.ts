import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserclientmappinglistComponent } from './userclientmappinglist.component';

describe('UserclientmappinglistComponent', () => {
  let component: UserclientmappinglistComponent;
  let fixture: ComponentFixture<UserclientmappinglistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserclientmappinglistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserclientmappinglistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
