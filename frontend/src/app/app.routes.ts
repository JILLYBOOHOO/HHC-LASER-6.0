import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ─── Public Website ─────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./features/public/layout/public-layout.component')
      .then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home/home.component')
          .then(m => m.HomeComponent),
        title: 'HHC Laser & Co. | Medical Spa Kingston Jamaica | Laser Hair Removal, Botox, Fillers',
      },
      {
        path: 'services',
        loadComponent: () => import('./features/public/services/services.component')
          .then(m => m.ServicesComponent),
        title: 'Medical Spa Services Kingston Jamaica | Laser Hair Removal, Botox, IV Therapy | HHC Laser',
      },
      {
        path: 'services/:slug',
        loadComponent: () => import('./features/public/service-detail/service-detail.component')
          .then(m => m.ServiceDetailComponent),
      },
      {
        path: 'gallery',
        loadComponent: () => import('./features/public/gallery/gallery.component')
          .then(m => m.GalleryComponent),
        title: 'Results Gallery | Med Spa Before & After | HHC Laser Jamaica',
      },
      {
        path: 'about',
        loadComponent: () => import('./features/public/about/about.component')
          .then(m => m.AboutComponent),
        title: 'About HHC Laser & Co. | Medical Aesthetic Clinic Kingston Jamaica',
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/public/contact/contact.component')
          .then(m => m.ContactComponent),
        title: 'Contact HHC Laser Jamaica | Book a Med Spa Consultation Kingston',
      },
      {
        path: 'consultation',
        loadComponent: () => import('./features/public/consultation/consultation.component')
          .then(m => m.ConsultationComponent),
        title: 'Free Consultation | HHC Laser',
      },
      {
        path: 'products',
        loadComponent: () => import('./features/public/products/products.component')
          .then(m => m.ProductsComponent),
        title: 'Luxury Medical Skincare Products Jamaica | HHC Laser & Co.',
      },
      {
        path: 'products/:slug',
        loadComponent: () => import('./features/public/product-detail/product-detail.component')
          .then(m => m.ProductDetailComponent),
        title: 'Product Detail — HHC LASER Jamaica',
      },
      {
        path: 'faq',
        loadComponent: () => import('./features/public/faq/faq.component')
          .then(m => m.FaqComponent),
        title: 'FAQ | Laser Hair Removal, Botox & Med Spa Questions | HHC Laser Jamaica',
      },
      {
        path: 'sitemap',
        loadComponent: () => import('./features/public/sitemap/sitemap.component')
          .then(m => m.SitemapComponent),
        title: 'Sitemap | HHC Laser Jamaica',
      },
      {
        path: 'refund-policy',
        loadComponent: () => import('./features/public/refund-policy/refund-policy.component')
          .then(m => m.RefundPolicyComponent),
        title: 'Refund Policy — HHC LASER Jamaica',
      },
      {
        path: 'terms-of-service',
        loadComponent: () => import('./features/public/terms-of-service/terms-of-service.component')
          .then(m => m.TermsOfServiceComponent),
        title: 'Terms of Service — HHC LASER Jamaica',
      },
      {
        path: 'privacy',
        loadComponent: () => import('./features/public/privacy-policy/privacy-policy.component')
          .then(m => m.PrivacyPolicyComponent),
        title: 'Privacy Policy — HHC LASER Jamaica',
      },
      {
        path: 'booking/success',
        loadComponent: () => import('./features/customer/booking/payment-success.component')
          .then(m => m.PaymentSuccessComponent),
        title: 'Payment Successful — HHC LASER',
      },
      {
        path: 'booking/failure',
        loadComponent: () => import('./features/customer/booking/payment-failure.component')
          .then(m => m.PaymentFailureComponent),
        title: 'Payment Failed — HHC LASER',
      },
      {
        path: 'payment/success',
        loadComponent: () => import('./features/public/payment-result/payment-result.component')
          .then(m => m.PaymentResultComponent),
        title: 'Payment Successful — HHC LASER',
      },
      {
        path: 'payment/failure',
        loadComponent: () => import('./features/public/payment-result/payment-result.component')
          .then(m => m.PaymentResultComponent),
        title: 'Payment Failed — HHC LASER',
      },
      {
        path: 'pay/:orderId',
        loadComponent: () => import('./features/public/pay/payment-link.component')
          .then(m => m.PaymentLinkComponent),
        title: 'Secure Payment — HHC LASER',
      }
    ],
  },

  // ─── Authentication ──────────────────────────────────────────────────────────
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/auth-layout/auth-layout.component')
      .then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent),
        title: 'Login — HHC LASER',
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => m.RegisterComponent),
        title: 'Create Account — HHC LASER',
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component')
          .then(m => m.ForgotPasswordComponent),
        title: 'Reset Password — HHC LASER',
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent),
        title: 'Choose New Password — HHC LASER',
      },
      {
        path: 'callback',
        loadComponent: () => import('./features/auth/oauth-callback/oauth-callback.component')
          .then(m => m.OauthCallbackComponent),
        title: 'Authenticating — HHC LASER',
      }
    ],
  },

  // ─── Customer Portal ─────────────────────────────────────────────────────────
  {
    path: 'customer',
    canActivate: [authGuard],
    data: { roles: ['customer', 'owner', 'admin', 'manager', 'specialist'] },
    loadComponent: () => import('./features/customer/customer-layout/customer-layout.component')
      .then(m => m.CustomerLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/customer/dashboard/customer-dashboard.component')
          .then(m => m.CustomerDashboardComponent),
        title: 'My Dashboard — HHC LASER',
      },
      {
        path: 'book',
        loadComponent: () => import('./features/customer/booking/booking.component')
          .then(m => m.BookingComponent),
        title: 'Book Appointment — HHC LASER',
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/customer/bookings/customer-bookings.component')
          .then(m => m.CustomerBookingsComponent),
        title: 'My Appointments — HHC LASER',
      },
      {
        path: 'bookings/:id',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/customer/profile/customer-profile.component')
          .then(m => m.CustomerProfileComponent),
        title: 'My Profile — HHC LASER',
      },
      {
        path: 'memberships',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
        title: 'Memberships & Packages — HHC LASER',
      },
      {
        path: 'medical',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
        title: 'Medical Information — HHC LASER',
      },
      {
        path: 'payment-success',
        loadComponent: () => import('./features/customer/payment-success/payment-success.component')
          .then(m => m.PaymentSuccessComponent),
        title: 'Payment Confirmed — HHC LASER',
      },
      {
        path: 'payment-failed',
        loadComponent: () => import('./features/customer/payment-failed/payment-failed.component')
          .then(m => m.PaymentFailedComponent),
        title: 'Payment Failed — HHC LASER',
        data: { failed: true },
      },
    ],
  },

  // ─── Employee Dashboard ──────────────────────────────────────────────────────
  {
    path: 'employee',
    canActivate: [roleGuard(['specialist', 'manager', 'admin', 'owner'])],
    loadComponent: () => import('./features/employee/employee-layout/employee-layout.component')
      .then(m => m.EmployeeLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'schedule' },
      {
        path: 'schedule',
        loadComponent: () => import('./features/employee/schedule/employee-schedule.component')
          .then(m => m.EmployeeScheduleComponent),
        title: 'My Schedule — HHC LASER',
      },
      {
        path: 'book',
        loadComponent: () => import('./features/employee/book/employee-book.component')
          .then(m => m.EmployeeBookComponent),
        title: 'Make Appointment — HHC LASER Staff',
      },
      {
        path: 'patients',
        loadComponent: () => import('./features/admin/patients/admin-patients.component')
          .then(m => m.AdminPatientsComponent),
        title: 'Patients — HHC LASER',
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/admin/patients/admin-patients.component')
          .then(m => m.AdminPatientsComponent),
        title: 'Patients — HHC LASER',
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('./features/employee/clients/employee-client-detail.component')
          .then(m => m.EmployeeClientDetailComponent),
      },
      {
        path: 'treatment-notes/:appointmentId',
        loadComponent: () => import('./features/employee/treatment-notes/treatment-notes.component')
          .then(m => m.TreatmentNotesComponent),
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/admin/transactions/admin-transactions.component')
          .then(m => m.AdminTransactionsComponent),
        title: 'Transactions — HHC LASER Staff',
        data: { hideKPIs: true }
      },
    ],
  },

  // ─── Admin Dashboard ─────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [roleGuard(['owner', 'admin', 'manager'])],
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component')
      .then(m => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard — HHC LASER',
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/admin/bookings/admin-bookings.component')
          .then(m => m.AdminBookingsComponent),
        title: 'Manage Bookings — HHC LASER',
      },
      {
        path: 'gallery',
        loadComponent: () => import('./features/admin/gallery/admin-gallery.component')
          .then(m => m.AdminGalleryComponent),
        title: 'Gallery — HHC LASER Admin',
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/admin/transactions/admin-transactions.component')
          .then(m => m.AdminTransactionsComponent),
        title: 'Transactions — HHC LASER Admin',
      },
      {
        path: 'provider-availability',
        loadComponent: () => import('./features/admin/provider-availability/admin-provider-availability.component')
          .then(m => m.AdminProviderAvailabilityComponent),
        title: 'Provider Availability — HHC LASER Admin',
      },
      {
        path: 'check-in',
        loadComponent: () => import('./features/admin/queue/admin-queue.component')
          .then(m => m.AdminQueueComponent),
        title: 'Check-in Queue — HHC LASER Admin',
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/services/admin-services.component')
          .then(m => m.AdminServicesComponent),
        title: 'Categories — HHC LASER Admin',
      },
      {
        path: 'services',
        loadComponent: () => import('./features/admin/services/admin-services.component')
          .then(m => m.AdminServicesComponent),
        title: 'Manage Services — HHC LASER',
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/admin-products.component')
          .then(m => m.AdminProductsComponent),
        title: 'Manage Products — HHC LASER',
      },
      {
        path: 'invoices',
        loadComponent: () => import('./features/admin/transactions/admin-transactions.component')
          .then(m => m.AdminTransactionsComponent),
        title: 'Invoices — HHC LASER Admin',
      },
      {
        path: 'maintenance-invoices',
        loadComponent: () => import('./features/admin/transactions/admin-transactions.component')
          .then(m => m.AdminTransactionsComponent),
        title: 'Maintenance Invoices — HHC LASER Admin',
      },
      {
        path: 'patients',
        loadComponent: () => import('./features/admin/patients/admin-patients.component')
          .then(m => m.AdminPatientsComponent),
        title: 'Patients — HHC LASER Admin',
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/admin-users.component')
          .then(m => m.AdminUsersComponent),
        title: 'Users — HHC LASER Admin',
      },
      {
        path: 'staff',
        redirectTo: 'users',
        pathMatch: 'full',
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/admin/roles/admin-roles.component')
          .then(m => m.AdminRolesComponent),
        title: 'Roles & Permissions — HHC LASER Admin',
      },
      {
        path: 'homepage',
        loadComponent: () => import('./features/admin/homepage-builder/admin-homepage-builder.component')
          .then(m => m.AdminHomepageBuilderComponent),
        title: 'Homepage Builder — HHC LASER',
      },
      {
        path: 'media',
        loadComponent: () => import('./features/admin/media/admin-media.component')
          .then(m => m.AdminMediaComponent),
        title: 'Media Library — HHC LASER',
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/admin-settings.component')
          .then(m => m.AdminSettingsComponent),
        title: 'Business Settings — HHC LASER',
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/reports/admin-reports.component')
          .then(m => m.AdminReportsComponent),
        title: 'Reports & Analytics — HHC LASER',
        canActivate: [roleGuard(['owner', 'admin'])],
      },
    ],
  },
  // ─── Utility ─────────────────────────────────────────────────────────────────
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component')
      .then(m => m.UnauthorizedComponent),
    title: 'Access Denied — HHC LASER',
  },

  // ─── Developer Dashboard ─────────────────────────────────────────────────────
  {
    path: 'developer',
    canActivate: [roleGuard(['developer', 'owner'])],
    loadComponent: () => import('./features/developer/developer-layout.component')
      .then(m => m.DeveloperLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () => import('./features/developer/system-overview/system-overview.component')
          .then(m => m.SystemOverviewComponent),
        title: 'System Overview — Dev Console',
      },
      {
        path: 'errors',
        loadComponent: () => import('./features/developer/error-monitoring/error-monitoring.component')
          .then(m => m.ErrorMonitoringComponent),
        title: 'Error Logs — Dev Console',
      },
      {
        path: 'auth-settings',
        loadComponent: () => import('./features/developer/auth-settings/auth-settings.component')
          .then(m => m.AuthSettingsComponent),
        title: 'Authentication Settings — Dev Console',
      }
    ]
  },

  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
    title: 'Page Not Found — HHC LASER',
  },
];
