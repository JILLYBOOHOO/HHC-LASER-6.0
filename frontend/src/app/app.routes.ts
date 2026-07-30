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
        title: 'HHC LASER Jamaica — Premier MedSpa',
      },
      {
        path: 'services',
        loadComponent: () => import('./features/public/services/services.component')
          .then(m => m.ServicesComponent),
        title: 'Our Services — HHC LASER Jamaica',
      },
      {
        path: 'services/:slug',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
      },
      {
        path: 'gallery',
        loadComponent: () => import('./features/public/gallery/gallery.component')
          .then(m => m.GalleryComponent),
        title: 'Gallery — HHC LASER Jamaica',
      },
      {
        path: 'about',
        loadComponent: () => import('./features/public/about/about.component')
          .then(m => m.AboutComponent),
        title: 'About Us — HHC LASER Jamaica',
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/public/contact/contact.component')
          .then(m => m.ContactComponent),
        title: 'Contact — HHC LASER Jamaica',
      },
      {
        path: 'products',
        loadComponent: () => import('./features/public/products/products.component')
          .then(m => m.ProductsComponent),
        title: 'Luxury Skincare Products — HHC LASER Jamaica',
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
        title: 'FAQ — HHC LASER Jamaica',
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
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
        title: 'My Appointments — HHC LASER',
      },
      {
        path: 'bookings/:id',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
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
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
        title: 'Payment Confirmed — HHC LASER',
      },
      {
        path: 'payment-failed',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
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
        path: 'clients',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
        title: 'My Clients — HHC LASER',
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
      },
      {
        path: 'photo-vault',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
        title: 'Photo Vault — HHC LASER',
      },
      {
        path: 'treatment-notes/:appointmentId',
        loadComponent: () => import('./features/employee/treatment-notes/treatment-notes.component')
          .then(m => m.TreatmentNotesComponent),
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
        path: 'customers',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
        title: 'Manage Customers — HHC LASER',
      },
      {
        path: 'staff',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
        title: 'Manage Staff — HHC LASER',
        canActivate: [roleGuard(['owner', 'admin'])],
      },
      {
        path: 'services',
        loadComponent: () => import('./features/admin/services/admin-services.component')
          .then(m => m.AdminServicesComponent),
        title: 'Manage Services — HHC LASER',
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
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
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
