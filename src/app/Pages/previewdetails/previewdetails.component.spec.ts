import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewdetailsComponent } from './previewdetails.component';

describe('PreviewdetailsComponent', () => {
  let component: PreviewdetailsComponent;
  let fixture: ComponentFixture<PreviewdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
