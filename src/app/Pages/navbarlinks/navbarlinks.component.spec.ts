import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarlinksComponent } from './navbarlinks.component';

describe('NavbarlinksComponent', () => {
  let component: NavbarlinksComponent;
  let fixture: ComponentFixture<NavbarlinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarlinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarlinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
