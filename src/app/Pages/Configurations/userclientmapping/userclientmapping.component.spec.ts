import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserclientmappingComponent } from './userclientmapping.component';

describe('UserclientmappingComponent', () => {
  let component: UserclientmappingComponent;
  let fixture: ComponentFixture<UserclientmappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserclientmappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserclientmappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
