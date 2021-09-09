import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherprovidermappingComponent } from './otherprovidermapping.component';

describe('OtherprovidermappingComponent', () => {
  let component: OtherprovidermappingComponent;
  let fixture: ComponentFixture<OtherprovidermappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherprovidermappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherprovidermappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
