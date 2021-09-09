import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddotherprovidermappingComponent } from './addotherprovidermapping.component';

describe('AddotherprovidermappingComponent', () => {
  let component: AddotherprovidermappingComponent;
  let fixture: ComponentFixture<AddotherprovidermappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddotherprovidermappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddotherprovidermappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
