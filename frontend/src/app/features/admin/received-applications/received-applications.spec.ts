import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceivedApplications } from './received-applications';

describe('ReceivedApplications', () => {
  let component: ReceivedApplications;
  let fixture: ComponentFixture<ReceivedApplications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedApplications],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceivedApplications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
