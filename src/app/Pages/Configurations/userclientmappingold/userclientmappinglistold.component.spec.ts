import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserclientmappinglistoldComponent } from './userclientmappinglistold.component';

describe('UserclientmappinglistoldComponent', () => {
  let component: UserclientmappinglistoldComponent;
  let fixture: ComponentFixture<UserclientmappinglistoldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserclientmappinglistoldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserclientmappinglistoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
