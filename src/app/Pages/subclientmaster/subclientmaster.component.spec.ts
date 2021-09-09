import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubclientmasterComponent } from './subclientmaster.component';

describe('SubclientmasterComponent', () => {
  let component: SubclientmasterComponent;
  let fixture: ComponentFixture<SubclientmasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubclientmasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubclientmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
