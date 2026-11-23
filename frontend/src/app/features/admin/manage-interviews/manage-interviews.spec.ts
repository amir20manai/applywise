import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageInterviews } from './manage-interviews';

describe('ManageInterviews', () => {
  let component: ManageInterviews;
  let fixture: ComponentFixture<ManageInterviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageInterviews],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageInterviews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
