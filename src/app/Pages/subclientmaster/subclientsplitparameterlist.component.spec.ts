import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubclientsplitparameterlistComponent } from './subclientsplitparameterlist.component';

describe('SubclientsplitparameterlistComponent', () => {
  let component: SubclientsplitparameterlistComponent;
  let fixture: ComponentFixture<SubclientsplitparameterlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubclientsplitparameterlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubclientsplitparameterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
