import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnprocessComponent } from './unprocess.component';

describe('UnprocessComponent', () => {
  let component: UnprocessComponent;
  let fixture: ComponentFixture<UnprocessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnprocessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnprocessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
