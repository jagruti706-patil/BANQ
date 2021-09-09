import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddprovidermappingComponent } from './addprovidermapping.component';

describe('AddprovidermappingComponent', () => {
  let component: AddprovidermappingComponent;
  let fixture: ComponentFixture<AddprovidermappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddprovidermappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddprovidermappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
