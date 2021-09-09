import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserclientmappingoldComponent } from './userclientmappingold.component';

describe('UserclientmappingoldComponent', () => {
  let component: UserclientmappingoldComponent;
  let fixture: ComponentFixture<UserclientmappingoldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserclientmappingoldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserclientmappingoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
