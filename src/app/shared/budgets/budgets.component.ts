import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Budget } from '../../models/Budget';
import { Customer } from '../../models/Customer';
import { Product } from '../../models/Product';
import {
  faEdit,
  faTrashAlt,
  faCheck,
  faWindowClose,
} from '@fortawesome/free-solid-svg-icons';
import { HttpService } from 'src/app/services/http.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.css', '../icon.css'],
})
export class BudgetsComponent implements OnInit {
  editIcon = faEdit;
  deleteIcon = faTrashAlt;
  checkIcon = faCheck;
  closeIcon = faWindowClose;

  customers: Customer[] = [];

  showNewCustomerForm: boolean = false;
  showAddBudgetForm: boolean = false;
  errorMessage!: string;
  services!: string | string[];
  showEditBudgetForm: boolean = false;
  formSubmitted = false;
  generateOrder = false;
  showProducts = false;
  showHoursInput = false;
  otherServicesSelected = false;
  loading = false;
  officerHours!: number;
  assistantHours!: number;
  updatedBudget!: Budget;
  customer: Customer = {
    customerId: 0,
    name: '',
  };
  newBudget: Budget = {
    budgetId: 0,
    budgetName: '',
    totalPrice: 0,
    budgetStatus: '',
    assistantHours: 0,
    officerHours: 0,
    productList: [],
    service: [],
    customer: { customerId: 0, name: '' },
  };
  budgets: Budget[] = [
    /*  
   {
      budgetId: 1,
      budgetName: 'abc',
      totalPrice: 546,
      budgetStatus: 'accepted',
      assistantHours: 0,
      officerHours: 0,
      productList: [],
      customer: { customerId: 112, name: 'cus1' },
      service: [],
    }, */
  ];
  showErrorAlert = false;
  showSuccessAlert = false;
  apiRequestError!: {
    error: { text: string };
    name: string;
    message: string;
    status: 0;
    url: string;
  };
  apiSuccessResponse = '';
  apiErrorResponse: string = '';
  processingNetworkRequest = false;
  products: Product[] = [
  /*   {
      productId: 0,
      name: 'asdsa',
      characteristics: 'gh',
      price: 0,
      quantityInStock: 0,
      tax: 0,
    },
    {
      productId: 1,
      name: 'czxfzx',
      characteristics: 'gh',
      price: 0,
      quantityInStock: 0,
      tax: 0,
    },
    {
      productId: 1,
      name: 'wqetrth',
      characteristics: 'gh',
      price: 0,
      quantityInStock: 0,
      tax: 0,
    }, */
  ];
  private subscriptions = new Subscription();

  constructor(
    private cd: ChangeDetectorRef,
    private budgetService: HttpService
  ) {
    this.loading = true;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.budgetService.getBudget().subscribe({
        next: (response: any) => {
          if (response.data && response.status === 200) {
            console.log(response);
            this.budgets = response.data;
          } else {
            this.showApiErrorResponse(response.message);
          }
          this.loading = false;
        },
        error: (error: any) => {
          this.showApiErrorResponse();
        },
      })
    );
    this.budgetService.getCustomer().subscribe({
      next: (response: any) => {
        if (response.data && response.status === 200) {
          this.customers = response.data.filter(
            (customer: Customer) => customer.name
          );
        }
      },
    });

    this.budgetService.getProduct().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.products = response.data;
        }
      },
    });
  }

  budgetPdfDownload(id: number, budget: Budget): void {
    this.budgetService.getBudgetPdf(id).subscribe({
      error: (error) => this.showApiErrorResponse(error.message),
    });
    console.log('budget to download with id ', id, 'object ', budget);
  }

  onSubmit() {
    this.errorMessage = '';
    console.log('inside submit', this.newBudget, this.services);
    console.log(
      this.newBudget.budgetName,
      this.newBudget.productList.map((data) => console.log(data))
    );
    if (
      !this.newBudget.budgetName ||
      this.newBudget.budgetName.trim().length === 0
    ) {
      this.errorMessage =
        'Please enter correct fields , All fields are necessary';
    } else {
      if (!this.newBudget.customer.name && !this.customer.name) {
        this.errorMessage =
          'Please enter correct fields , All fields are necessary';
      } else {
        this.processingNetworkRequest = true;
        this.newBudget.customer = { customerId: 0, name: this.customer.name };
        this.newBudget.budgetStatus = 'pendingAcceptance';
        console.log('final budgett', this.newBudget);
        this.budgetService.addBudget(this.newBudget).subscribe({
          next: (response: any) => {
            if (response.status === 200) {
              this.showApiSuccessResponse(response.message);
              this.budgets.push(this.newBudget);
            } else this.showApiErrorResponse(response.message);
          },
          error: () => {
            this.showApiErrorResponse();
          },
          complete: () => {
            this.showAddBudgetForm = false;
            this.formSubmitted = true;
            this.processingNetworkRequest = false;
          },
        });
      }
    }
  }

  onClickToggleAddBudgetForm() {
    setTimeout(() => {
      this.errorMessage = '';
      this.showAddBudgetForm = !this.showAddBudgetForm;

      this.cd.markForCheck();
    }, 200);
  }
  onClickToggleEditBudgetForm() {
    setTimeout(() => {
      this.errorMessage = '';
      this.showEditBudgetForm = !this.showEditBudgetForm;

      this.cd.markForCheck();
    }, 200);
  }
  onEditBudget(id: number, budget: Budget) {
    this.updatedBudget = budget;
    if (budget.budgetStatus.trim().toLowerCase() !== 'accepted') {
      this.generateOrder = true;
    }
    setTimeout(() => {
      this.showEditBudgetForm = true;
      this.cd.markForCheck();
    }, 250);
    console.log('edit', id, budget);
  }

  onDeleteBudget(id: number, budget: Budget) {
    this.budgetService.deleteBudget(id).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.showApiSuccessResponse(response.message);
          this.budgets = this.budgets.filter(
            (o) => o.budgetId != budget.budgetId
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

  onUpdateBudget(updatedBudget: Budget) {
    this.errorMessage = '';
    console.log('update', updatedBudget);
    if (
      !this.updatedBudget.budgetName ||
      this.updatedBudget.budgetName.trim().length === 0
    ) {
      this.errorMessage =
        'Please enter correct fields , All fields are necessary';
      return this.errorMessage;
    }
    console.log('update', updatedBudget);
    console.log('customer is ', updatedBudget.customer);

    if (
      updatedBudget.budgetStatus.trim().toLowerCase() === 'accepted' &&
      this.generateOrder
    ) {
      this.processingNetworkRequest = true;
      console.log('generating order');
      this.budgetService.budgetToOrder(updatedBudget.budgetId).subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.showApiSuccessResponse(response.message);
          } else this.showApiErrorResponse(response.message);
        },
        error: (error: any) => {
          this.showApiErrorResponse();
        },
      });
    } else {
      this.processingNetworkRequest = true;
      this.budgetService.updateBudget(updatedBudget).subscribe({
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
          this.showEditBudgetForm = false;
          this.formSubmitted = true;
          this.processingNetworkRequest = false;
        },
      });
    }

    return this.errorMessage;
  }
  isInstallationSelected(services: any) {
    console.log('isInstallation', services);

    if (services.includes('installation')) {
      this.showProducts = true;
    } else {
      this.showProducts = false;
    }

    if (services.includes('maintenance') || services.includes('labour')) {
      this.showHoursInput = true;
    } else {
      this.showHoursInput = false;
    }
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
      this.loading = false;
    }, 3500);
  }

  showApiSuccessResponse(message: string) {
    this.apiSuccessResponse = message;
    this.showSuccessAlert = true;
    this.processingNetworkRequest = false;
    setTimeout(() => {
      this.showSuccessAlert = false;
    }, 3500);
  }

  isNewCustomerSelected(customer: any) {
    console.log('isNewCustomer', customer);
    console.log(this.newBudget.customer);

    if (customer == 'newCustomer') {
      this.showNewCustomerForm = true;
    } else this.showNewCustomerForm = false;

    return customer;
  }
}
