import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  faEdit,
  faTrashAlt,
  faCheck,
  faWindowClose,
} from '@fortawesome/free-solid-svg-icons';
import { apiRequestError } from 'src/app/models/apiRequestError';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { HttpService } from 'src/app/services/http.service';
import { Employee } from '../../models/Employee';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css', '../../shared/icon.css'],
})
export class EmployeesComponent implements OnInit {
  editIcon = faEdit;
  deleteIcon = faTrashAlt;
  checkIcon = faCheck;
  closeIcon = faWindowClose;
  showErrorAlert = false;
  showSuccessAlert = false;
  apiRequestError: apiRequestError = {
    error: {
      text: '',
    },
    name: '',
    message: '',
    status: 0,
    url: '',
  };
  apiSuccessResponse = '';
  apiErrorResponse: string = '';

  newEmployee: Employee = {
    username: '',
    email: '',
    password: '',
    type: '',
    priceTime: 0,
    workLogList: [],
  };
  errorMessage!: string;
  formSubmitted: Boolean = false;
  showAddEmployeeForm: Boolean = false;
  updatedEmployee!: Employee;
  services!: string | string[];
  showEditEmployeeForm: Boolean = false;
  processingNetworkRequest: Boolean = false;
  employees: Employee[] = [
    // {
    //   employeeId: 1,
    //   type: 'emp',
    //   username: 'fawad',
    //   email: '',
    //   password: '12312',
    //   priceTime: 69,
    //   workLogList: [
    //     {
    //       workLogId: 1,
    //       date: new Date(),
    //       numberOfHours: 5,
    //       order: {
    //         orderId: 1,
    //         type: ['abc'],
    //         name: 'abc',
    //         status: 'accepted',
    //         productList: [],
    //         customer: { customerId: 112, name: 'cus1' },
    //       },
    //     },
    //     {
    //       workLogId: 2,
    //       date: new Date(),
    //       numberOfHours: 3,
    //       order: {
    //         orderId: 3,
    //         type: ['abc'],
    //         name: 'abc',
    //         status: 'accepted',
    //         productList: [],
    //         customer: { customerId: 112, name: 'cus1' },
    //       },
    //     },
    //     {
    //       workLogId: 3,
    //       date: new Date(),
    //       numberOfHours: 4,
    //       order: {
    //         orderId: 1,
    //         type: ['abc'],
    //         name: 'abc',
    //         status: 'accepted',
    //         customer: { customerId: 112, name: 'cus1' },
    //       },
    //     },
    //   ],
    // },
    // {
    //   employeeId: 1,
    //   type: 'asd',
    //   username: 'zxc',
    //   email: '',
    //   password: '2q',
    //   priceTime: 69,
    //   workLogList: [],
    // },
    // {
    //   employeeId: 1,
    //   type: 'asd',
    //   username: '2wre',
    //   email: '',
    //   password: 'gbf',
    //   priceTime: 69,
    //   workLogList: [],
    // },
  ];

  constructor(
    private cd: ChangeDetectorRef,
    private httpEmployeeService: HttpService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.httpEmployeeService.getEmployee().subscribe({
      next: (response: any) => {
        console.log(response);
        if (response.data && response.status === 200) {
          this.employees = response.data;
        } else {
          this.showApiErrorResponse(response.message);
        }
      },
      error: (error: any) => {
        this.showApiErrorResponse();
      },
    });
  }

  onSubmit() {
    console.log('employee is ', this.newEmployee);
    if (
      !this.newEmployee.username ||
      this.newEmployee.username.trim().length === 0 ||
      !this.newEmployee.email ||
      this.newEmployee.email.trim().length === 0 ||
      !this.newEmployee.password ||
      this.newEmployee.password.trim().length < 6
    ) {
      return (this.errorMessage =
        'Please enter correct fields , All fields are necessary');
    } else {
      this.errorMessage = '';
      this.processingNetworkRequest = true;
      const { email, password, type, username } = this.newEmployee;
      this.authService
        .signUp(email, password, type, username)
        .then(() => {
          this.httpEmployeeService.addEmployee(this.newEmployee).subscribe({
            next: (response: any) => {
              if (response.status === 200) {
                this.employees.push(this.newEmployee);
                this.showApiSuccessResponse(response.message);
              } else {
                this.showApiErrorResponse(response.message);
              }
            },
            error: (error: any) => {
              this.showApiErrorResponse();
            },
            complete: () => {
              this.errorMessage = '';
              this.showAddEmployeeForm = false;
              this.formSubmitted = true;
              this.processingNetworkRequest = false;
            },
          });
        })
        .catch((_error: string) => {
          this.errorMessage = _error;
        });

      return this.errorMessage;
    }
  }

  onClickToggleAddEmployeeForm() {
    setTimeout(() => {
      this.errorMessage = '';
      this.showAddEmployeeForm = !this.showAddEmployeeForm;

      this.cd.markForCheck();
    }, 200);
  }
  onClickToggleEditEmployeeForm() {
    setTimeout(() => {
      this.errorMessage = '';
      this.showEditEmployeeForm = !this.showEditEmployeeForm;

      this.cd.markForCheck();
    }, 200);
  }
  onEditEmployee(employee: Employee) {
    this.updatedEmployee = employee;

    setTimeout(() => {
      this.showEditEmployeeForm = true;
      this.cd.markForCheck();
    }, 250);
    console.log('edit', employee);
  }

  onDeleteEmployee(id: any, employee: Employee) {
    console.log('delete', id, employee);
    this.httpEmployeeService.deleteEmployee(id).subscribe({
      next: (response) => {
        console.log('response', response);
        if (response.status === 200) {
          this.showApiSuccessResponse(response.message);
          this.employees = this.employees.filter(
            (e) => e.username !== employee.username
          );
        } else {
          this.showApiErrorResponse(response.message);
        }
      },
      error: (error: any) => {
        this.showApiErrorResponse();
      },
    });
  }

  onUpdateEmployee(updatedEmployee: Employee) {
    this.processingNetworkRequest = true;

    this.errorMessage = '';

    if (
      !this.updatedEmployee.username ||
      this.updatedEmployee.username.trim().length === 0 ||
      !this.updatedEmployee.email ||
      this.updatedEmployee.email.trim().length === 0 ||
      !this.updatedEmployee.password ||
      this.updatedEmployee.password.trim().length < 6
    ) {
      this.errorMessage =
        'Please enter correct fields , All fields are necessary';
      this.processingNetworkRequest = false;
      return this.errorMessage;
    } else {
      this.httpEmployeeService.updateEmployee(updatedEmployee).subscribe({
        next: (response: any) => {
          if (response.data && response.status === 200) {
            this.showApiSuccessResponse(response.message);
          } else {
            this.showApiErrorResponse(response.message);
          }
        },
        error: (error: any) => {
          this.showApiErrorResponse();
        },
        complete: () => {
          this.showEditEmployeeForm = false;
          this.formSubmitted = true;
          this.processingNetworkRequest = false;
        },
      });
    }

    return this.errorMessage;
  }

  getEmployeeById(id: any) {
    this.httpEmployeeService.getEmployeeById(20).subscribe((response: any) => {
      if (response.data && response.status === 200) {
        this.showApiSuccessResponse(response.message);
        console.log('getEmployeeById', response);
      } else {
        this.showApiErrorResponse(response.message);
      }
      (error: any) => {
        this.showApiErrorResponse();
      };
    });
  }

  showApiErrorResponse(message?: any) {
    if (message) {
      this.apiErrorResponse = message;
    } else {
      this.apiErrorResponse =
        'Error! please check your internet connection and try again';
    }
    this.showErrorAlert = true;
    this.processingNetworkRequest = false;

    setTimeout(() => {
      this.showErrorAlert = false;
    }, 3500);
  }

  showApiSuccessResponse(message: string) {
    this.apiSuccessResponse = message;
    this.showSuccessAlert = true;
    setTimeout(() => {
      this.showSuccessAlert = false;
    }, 3500);
  }
}
