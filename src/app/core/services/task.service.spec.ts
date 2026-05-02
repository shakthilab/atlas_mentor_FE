import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get tasks', () => {
    const mockTasks = [
      { id: 1, title: 'Test Task', status: 'TO_DO', priority: 'HIGH' }
    ];

    service.getTasks().subscribe(tasks => {
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should get task details', () => {
    const mockTaskDetails = {
      task: { id: 1, title: 'Test Task' },
      comments: [],
      activities: []
    };

    service.getTaskDetails(1).subscribe(details => {
      expect(details).toEqual(mockTaskDetails);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/tasks/1/details');
    expect(req.request.method).toBe('GET');
    req.flush(mockTaskDetails);
  });

  it('should update task status', () => {
    const taskId = 1;
    const newStatus = 'DONE';

    service.updateStatus(taskId, newStatus).subscribe();

    const req = httpMock.expectOne(`http://localhost:8080/api/tasks/${taskId}/status`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: newStatus });
    req.flush({});
  });

  it('should add comment', () => {
    const taskId = 1;
    const comment = 'Test comment';

    service.addComment(taskId, comment).subscribe();

    const req = httpMock.expectOne(`http://localhost:8080/api/tasks/${taskId}/comments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ comment });
    req.flush({});
  });

  it('should assign user', () => {
    const taskId = 1;
    const userId = 3;

    service.assignUser(taskId, userId).subscribe();

    const req = httpMock.expectOne(`http://localhost:8080/api/tasks/${taskId}/assignee`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ assignedToId: userId });
    req.flush({});
  });

  it('should get activity', () => {
    const taskId = 1;
    const mockActivities = [
      { id: 1, action: 'Status changed', timestamp: '2024-01-01' }
    ];

    service.getActivity(taskId).subscribe(activities => {
      expect(activities).toEqual(mockActivities);
    });

    const req = httpMock.expectOne(`http://localhost:8080/api/tasks/${taskId}/activity`);
    expect(req.request.method).toBe('GET');
    req.flush(mockActivities);
  });
});
