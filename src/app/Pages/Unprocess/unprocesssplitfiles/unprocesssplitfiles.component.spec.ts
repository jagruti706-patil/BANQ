import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnprocesssplitfilesComponent } from './unprocesssplitfiles.component';

describe('UnprocesssplitfilesComponent', () => {
  let component: UnprocesssplitfilesComponent;
  let fixture: ComponentFixture<UnprocesssplitfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnprocesssplitfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnprocesssplitfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
