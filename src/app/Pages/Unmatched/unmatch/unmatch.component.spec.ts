import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnmatchComponent } from './unmatch.component';

describe('UnmatchComponent', () => {
  let component: UnmatchComponent;
  let fixture: ComponentFixture<UnmatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnmatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnmatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
