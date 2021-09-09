import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSplitfilesdataComponent } from './all-splitfilesdata.component';

describe('AllSplitfilesdataComponent', () => {
  let component: AllSplitfilesdataComponent;
  let fixture: ComponentFixture<AllSplitfilesdataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllSplitfilesdataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllSplitfilesdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
