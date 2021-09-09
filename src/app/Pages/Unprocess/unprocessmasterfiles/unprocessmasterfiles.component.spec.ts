import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnprocessmasterfilesComponent } from './unprocessmasterfiles.component';

describe('UnprocessmasterfilesComponent', () => {
  let component: UnprocessmasterfilesComponent;
  let fixture: ComponentFixture<UnprocessmasterfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnprocessmasterfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnprocessmasterfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
