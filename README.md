# 🎓 Tech Financial System - Ed-Tech Platform

A comprehensive financial management system for educational technology platforms that enables seamless coordination between trainers, clients, and administrators with milestone-based training tracking, purchase order management, and automated invoicing.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Angular](https://img.shields.io/badge/Angular-18.0.0-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.2-blue.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#system-architecture)
- [Workflow](#workflow)
- [Screenshots](#screenshots)


## 🌟 Overview

The Tech Financial System is a full-featured educational platform management system designed to streamline the entire lifecycle of training programs - from client registration to trainer payment. The system handles milestone-based training progress, intelligent trainer-client matching, purchase order generation with profit margin management, and automated invoice processing.

### Key Highlights

- ✅ **Role-Based Access Control** - Separate dashboards for Admin, Trainer, and Client
- ✅ **Milestone-Based Training** - Monthly module tracking with progress visualization
- ✅ **Smart Matching System** - AI-powered trainer-client pairing based on skills
- ✅ **Financial Automation** - Automated PO generation and invoice processing
- ✅ **Real-Time Notifications** - Instant updates for all stakeholders
- ✅ **Profit Margin Management** - Flexible profit calculation for admin

## 🚀 Features

### For Administrators

- **Dashboard Analytics**
  - Real-time statistics (pending requests, active trainings, revenue)
  - Recent activity feed with dynamic updates
  - Progress tracking across all trainings
  
- **User Management**
  - Approve/reject trainer applications
  - Approve/reject client requests
  - View detailed profiles with skills and requirements

- **Trainer-Client Mapping**
  - Intelligent skill-based matching
  - Visual skill match indicators
  - One-click training assignment creation

- **Purchase Order Management**
  - View client-generated POs
  - Process POs with custom profit margins
  - Automatic trainer PO generation
  - Real-time profit calculations

- **Invoice Management**
  - Approve/reject trainer invoices
  - Send payment reminders to clients
  - Mark invoices as paid
  - Track payment history

- **Progress Tracking**
  - View all training milestones
  - Monitor completion percentages
  - Track client and trainer activities

- **Reporting**
  - Generate monthly performance reports
  - Download reports in PDF format
  - Comprehensive financial summaries

### For Trainers

- **Application System**
  - Register with skills, experience, and expected rate
  - Upload resume
  - Track application status (Pending/Approved/Rejected)

- **Training Dashboard**
  - View assigned trainings with client details
  - Track ongoing and completed trainings
  - Monitor total earnings

- **Milestone Management**
  - View client-completed milestones
  - Verify milestone completion
  - Track training progress

- **Purchase Order Viewing**
  - See generated POs with amounts
  - View profit margin deductions
  - Track PO status

- **Invoice Generation**
  - Generate invoices after all milestones verified
  - Auto-populated from PO amounts
  - Submit invoices to admin

- **Payment Reminders**
  - Send payment reminders to admin
  - Track submitted invoice status

### For Clients

- **Registration**
  - Provide company details and training requirements
  - Specify technology needs and budget
  - Set expected start dates

- **Training Management**
  - View assigned trainers with skills
  - Monitor training progress
  - Track training duration

- **Milestone Tracking**
  - View monthly training milestones
  - Mark milestones as completed
  - Visual progress bars
  - Status indicators (Pending/In Progress/Completed)

- **Purchase Order Generation**
  - Generate POs for approved trainings
  - Automatic amount calculation
  - Instant admin notification

- **Training Verification**
  - Verify completed trainings
  - Trigger invoice generation process
  - Provide feedback

## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 21.0.0
- **Language**: TypeScript 5.5.2
- **Styling**: CSS3 with custom animations
- **Routing**: Angular Router
- **Forms**: Reactive Forms & Template-driven Forms

### State Management
- **Local Storage** - For data persistence
- **RxJS** - For reactive programming
- **Services** - Singleton pattern for shared state

### Build Tools
- **Angular CLI** - Development and build automation
- **TypeScript Compiler** - Type checking and transpilation
- **Webpack** - Module bundling (via Angular CLI)

## 🏗️ Project Structure

---

Tech_Financial_System/
│
├── 📄 README.md                              # Project documentation
├── 📄 package.json                           # Node dependencies and scripts
├── 📄 package-lock.json                      # Locked versions of dependencies
├── 📄 tsconfig.json                          # TypeScript configuration
├── 📄 tsconfig.app.json                      # TypeScript config for app
├── 📄 tsconfig.spec.json                     # TypeScript config for tests
├── 📄 angular.json                           # Angular CLI configuration
├── 📄 .gitignore                             # Git ignore rules
├── 📄 .editorconfig                          # Editor configuration
│
├── 📁 src/                                   # Source code directory
│   │
│   ├── 📄 index.html                         # Main HTML file
│   ├── 📄 main.ts                            # Application entry point
│   ├── 📄 styles.css                         # Global styles
│   │
│   ├── 📁 app/                               # Application root
│   │   │
│   │   ├── 📄 app.component.ts               # Root component (TypeScript)
│   │   ├── 📄 app.component.html             # Root component (Template)
│   │   ├── 📄 app.component.css              # Root component (Styles)
│   │   ├── 📄 app.routes.ts                  # Application routing configuration
│   │   │
│   │   ├── 📁 auth/                          # Authentication module
│   │   │   ├── 📄 auth-service.ts            # Authentication service
│   │   │   │                                 #   - Login/logout logic
│   │   │   │                                 #   - User session management
│   │   │   │                                 #   - Notification creation
│   │   │   │                                 #   - Role verification
│   │   │   │
│   │   │   └── 📄 auth.guard.ts              # Route guard
│   │   │                                     #   - Protects routes by role
│   │   │                                     #   - Redirects unauthorized users
│   │   │
│   │   ├── 📁 models/                        # Data models (TypeScript interfaces)
│   │   │   ├── 📄 user.ts                    # User model
│   │   │   │                                 #   - id, email, password, role, name
│   │   │   │
│   │   │   ├── 📄 trainer.ts                 # Trainer model
│   │   │   │                                 #   - Profile, skills, experience
│   │   │   │                                 #   - Expected rate, status
│   │   │   │
│   │   │   ├── 📄 client.ts                  # Client model
│   │   │   │                                 #   - Company details
│   │   │   │                                 #   - Requirements, budget
│   │   │   │
│   │   │   ├── 📄 training.ts                # Training model
│   │   │   │                                 #   - Assignment details
│   │   │   │                                 #   - Milestones array
│   │   │   │                                 #   - Progress tracking
│   │   │   │                                 #   - Milestone interface
│   │   │   │
│   │   │   ├── 📄 po-model.ts                # Purchase Order model
│   │   │   │                                 #   - CLIENT_PO and TRAINER_PO
│   │   │   │                                 #   - Profit margin fields
│   │   │   │
│   │   │   ├── 📄 invoice.ts                 # Invoice model
│   │   │   │                                 #   - Billing details
│   │   │   │                                 #   - Payment status
│   │   │   │
│   │   │   └── 📄 notification.ts            # Notification model
│   │   │                                     #   - Alert messages
│   │   │                                     #   - Read status
│   │   │
│   │   ├── 📁 shared/                        # Shared components and services
│   │   │   │
│   │   │   ├── 📄 notification.service.ts    # Toast notification service
│   │   │   │                                 #   - success(), error(), warning(), info()
│   │   │   │                                 #   - Toast management
│   │   │   │
│   │   │   ├── 📄 toast.component.ts         # Toast component
│   │   │   │                                 #   - Visual toast notifications
│   │   │   │                                 #   - Auto-dismiss functionality
│   │   │   │
│   │   │   └── 📁 services/                  # Additional shared services
│   │   │       │
│   │   │       ├── 📄 business-logic.service.ts  # Business logic utilities
│   │   │       │                             #   - PO generation logic
│   │   │       │                             #   - Invoice calculations
│   │   │       │
│   │   │       └── 📄 dev-data-helper.ts     # Development test data
│   │   │                                     #   - Creates sample users
│   │   │                                     #   - Generates test data
│   │   │
│   │   ├── 📁 features/                      # Feature modules
│   │   │   │
│   │   │   ├── 📁 role-selection/            # Role selection & authentication
│   │   │   │   ├── 📄 role-selection.component.ts    # Main role selection logic
│   │   │   │   │                             #   - Register trainer/client
│   │   │   │   │                             #   - Login for all roles
│   │   │   │   │                             #   - Profile creation
│   │   │   │   │                             #   - Dev data initialization
│   │   │   │   │
│   │   │   │   ├── 📄 role-selection.component.html  # Role selection UI
│   │   │   │   │                             #   - Tab interface (Admin/Trainer/Client)
│   │   │   │   │                             #   - Login/Register forms
│   │   │   │   │                             #   - Dev tools buttons
│   │   │   │   │
│   │   │   │   └── 📄 role-selection.component.css   # Role selection styles
│   │   │   │                                 #   - Dark theme
│   │   │   │                                 #   - Card layouts
│   │   │   │
│   │   │   ├── 📁 auth/                      # Authentication components
│   │   │   │   │
│   │   │   │   ├── 📁 login/                 # Generic login component
│   │   │   │   │   ├── 📄 login.component.ts
│   │   │   │   │   ├── 📄 login.component.html
│   │   │   │   │   └── 📄 login.component.css
│   │   │   │   │
│   │   │   │   ├── 📁 register/              # Generic register component
│   │   │   │   │   ├── 📄 register.component.ts
│   │   │   │   │   ├── 📄 register.component.html
│   │   │   │   │   └── 📄 register.component.css
│   │   │   │   │
│   │   │   │   ├── 📁 trainer-login/         # Trainer-specific login (optional)
│   │   │   │   ├── 📁 trainer-register/      # Trainer-specific register (optional)
│   │   │   │   ├── 📁 client-login/          # Client-specific login (optional)
│   │   │   │   └── 📁 client-register/       # Client-specific register (optional)
│   │   │   │
│   │   │   ├── 📁 admin/                     # Admin feature module
│   │   │   │   │
│   │   │   │   ├── 📁 admin-dashboard/       # Admin main dashboard
│   │   │   │   │   ├── 📄 admin-dashboard.component.ts
│   │   │   │   │   │                         #   - Load all data (trainers, clients, POs, trainings)
│   │   │   │   │   │                         #   - Calculate statistics
│   │   │   │   │   │                         #   - Recent activities with dynamic data
│   │   │   │   │   │                         #   - Refresh functionality
│   │   │   │   │   │                         #   - System actions (report generation, reminders)
│   │   │   │   │   │
│   │   │   │   │   ├── 📄 admin-dashboard.component.html
│   │   │   │   │   │                         #   - Stats cards (pending requests, trainings, revenue)
│   │   │   │   │   │                         #   - Recent activity feed
│   │   │   │   │   │                         #   - Quick action buttons
│   │   │   │   │   │                         #   - Navigation to sub-modules
│   │   │   │   │   │
│   │   │   │   │   └── 📄 admin-dashboard.component.css
│   │   │   │   │                             #   - Dashboard grid layout
│   │   │   │   │                             #   - Card styles
│   │   │   │   │                             #   - Activity feed styles
│   │   │   │   │
│   │   │   │   ├── 📁 trainer-requests/      # Trainer approval module
│   │   │   │   │   ├── 📄 trainer-requests.component.ts
│   │   │   │   │   │                         #   - Load pending trainers
│   │   │   │   │   │                         #   - Approve/reject trainers
│   │   │   │   │   │                         #   - Send notifications
│   │   │   │   │   │
│   │   │   │   │   ├── 📄 trainer-requests.component.html
│   │   │   │   │   │                         #   - Trainer cards with details
│   │   │   │   │   │                         #   - Skills display
│   │   │   │   │   │                         #   - Hire/Reject buttons
│   │   │   │   │   │
│   │   │   │   │   └── 📄 trainer-requests.component.css
│   │   │   │   │
│   │   │   │   ├── 📁 client-requests/       # Client approval module
│   │   │   │   │   ├── 📄 client-requests.component.ts
│   │   │   │   │   │                         #   - Load pending clients
│   │   │   │   │   │                         #   - Approve/reject clients
│   │   │   │   │   │
│   │   │   │   │   ├── 📄 client-requests.component.html
│   │   │   │   │   │                         #   - Client cards with requirements
│   │   │   │   │   │                         #   - Technology needs
│   │   │   │   │   │                         #   - Approve/Reject buttons
│   │   │   │   │   │
│   │   │   │   │   └── 📄 client-requests.component.css
│   │   │   │   │
│   │   │   │   ├── 📁 mapping/               # Trainer-Client mapping module
│   │   │   │   │   ├── 📄 mapping.component.ts
│   │   │   │   │   │                         #   - Load approved trainers and clients
│   │   │   │   │   │                         #   - Skill-based matching algorithm
│   │   │   │   │   │                         #   - Create training assignments
│   │   │   │   │   │                         #   - Generate milestones automatically
│   │   │   │   │   │                         #   - Parse duration and create monthly modules
│   │   │   │   │   │
│   │   │   │   │   ├── 📄 mapping.component.html
│   │   │   │   │   │                         #   - Two-panel layout (clients | trainers)
│   │   │   │   │   │                         #   - Skill match indicators (✓ Skill Match)
│   │   │   │   │   │                         #   - Training assignment form
│   │   │   │   │   │
│   │   │   │   │   └── 📄 mapping.component.css
│   │   │   │   │
│   │   │   │   ├── 📁 po-management/         # Purchase Order management
│   │   │   │   │   ├── 📄 po-management.component.ts
│   │   │   │   │   │                         #   - Load client POs and trainer POs
│   │   │   │   │   │                         #   - Process client POs with profit margin
│   │   │   │   │   │                         #   - Calculate admin profit
│   │   │   │   │   │                         #   - Create trainer POs automatically
│   │   │   │   │   │                         #   - Send notifications to trainers
│   │   │   │   │   │                         #   - Auto-reload on navigation
│   │   │   │   │   │
│   │   │   │   │   ├── 📄 po-management.component.html
│   │   │   │   │   │                         #   - Tab interface (Client POs | Trainer POs)
│   │   │   │   │   │                         #   - PO cards with details
│   │   │   │   │   │                         #   - "Process PO" button
│   │   │   │   │   │                         #   - Processing modal with profit slider
│   │   │   │   │   │                         #   - Real-time calculations display
│   │   │   │   │   │
│   │   │   │   │   └── 📄 po-management.component.css
│   │   │   │   │                             #   - Modal styles
│   │   │   │   │                             #   - Slider styles
│   │   │   │   │                             #   - PO card layouts
│   │   │   │   │
│   │   │   │   ├── 📁 invoice-management/    # Invoice approval module
│   │   │   │   │   ├── 📄 invoice-management.component.ts
│   │   │   │   │   │                         #   - Load trainer and client invoices
│   │   │   │   │   │                         #   - Approve/reject invoices
│   │   │   │   │   │                         #   - Mark as paid
│   │   │   │   │   │                         #   - Send payment reminders
│   │   │   │   │   │
│   │   │   │   │   ├── 📄 invoice-management.component.html
│   │   │   │   │   │                         #   - Tab interface (Trainer | Client)
│   │   │   │   │   │                         #   - Invoice cards with status
│   │   │   │   │   │                         #   - Action buttons (Approve/Reject/Mark Paid)
│   │   │   │   │   │                         #   - "Remind Client" button
│   │   │   │   │   │
│   │   │   │   │   └── 📄 invoice-management.component.css
│   │   │   │   │
│   │   │   │   └── 📁 progress-tracking/     # Training progress tracking
│   │   │   │       ├── 📄 progress-tracking.component.ts
│   │   │   │       │                         #   - Load all trainings with milestones
│   │   │   │       │                         #   - Calculate completion percentages
│   │   │   │       │                         #   - Get client and trainer names
│   │   │   │       │                         #   - Real-time progress monitoring
│   │   │   │       │
│   │   │   │       ├── 📄 progress-tracking.component.html
│   │   │   │       │                         #   - Training cards with progress bars
│   │   │   │       │                         #   - Milestone breakdown
│   │   │   │       │                         #   - Completion status indicators
│   │   │   │       │                         #   - Client and trainer info
│   │   │   │       │
│   │   │   │       └── 📄 progress-tracking.component.css
│   │   │   │                                 #   - Progress bar animations
│   │   │   │                                 #   - Milestone grid layouts
│   │   │   │
│   │   │   ├── 📁 trainer/                   # Trainer feature module
│   │   │   │   │
│   │   │   │   └── 📁 trainer-dashboard/     # Trainer main dashboard
│   │   │   │       ├── 📄 trainer-dashboard.component.ts
│   │   │   │       │                         #   - Load trainer data and trainings
│   │   │   │       │                         #   - Load purchase orders
│   │   │   │       │                         #   - Load invoices
│   │   │   │       │                         #   - Verify milestones completed by client
│   │   │   │       │                         #   - Generate invoices (after all milestones verified)
│   │   │   │       │                         #   - Send payment reminders
│   │   │   │       │                         #   - Calculate earnings
│   │   │   │       │                         #   - Refresh functionality
│   │   │   │       │
│   │   │   │       ├── 📄 trainer-dashboard.component.html
│   │   │   │       │                         #   - Stats cards (trainings, POs, earnings)
│   │   │   │       │                         #   - Application status (Pending/Approved)
│   │   │   │       │                         #   - Assigned trainings with milestones
│   │   │   │       │                         #   - Milestone verification interface
│   │   │   │       │                         #   - "Raise Invoice" button (conditional)
│   │   │   │       │                         #   - My Purchase Orders section
│   │   │   │       │                         #   - Submitted invoices section
│   │   │   │       │                         #   - Payment reminder buttons
│   │   │   │       │
│   │   │   │       └── 📄 trainer-dashboard.component.css
│   │   │   │                                 #   - Dashboard layouts
│   │   │   │                                 #   - Milestone cards
│   │   │   │                                 #   - Button states (enabled/disabled)
│   │   │   │
│   │   │   └── 📁 client/                    # Client feature module
│   │   │       │
│   │   │       └── 📁 client-dashboard/      # Client main dashboard
│   │   │           ├── 📄 client-dashboard.component.ts
│   │   │           │                         #   - Load client data and trainings
│   │   │           │                         #   - Load purchase orders
│   │   │           │                         #   - Generate PO for training
│   │   │           │                         #   - Mark milestones as completed
│   │   │           │                         #   - Verify training completion
│   │   │           │                         #   - Calculate progress
│   │   │           │
│   │   │           ├── 📄 client-dashboard.component.html
│   │   │           │                         #   - Stats cards (trainings, POs)
│   │   │           │                         #   - Application status
│   │   │           │                         #   - Ongoing trainings with milestones
│   │   │           │                         #   - Milestone completion checkboxes
│   │   │           │                         #   - Progress bars
│   │   │           │                         #   - "Generate PO" button
│   │   │           │                         #   - "Verify Training" button
│   │   │           │
│   │   │           └── 📄 client-dashboard.component.css
│   │   │                                     #   - Dashboard layouts
│   │   │                                     #   - Milestone interface styles
│   │   │                                     #   - Progress indicators
│   │   │
│   │   └── 📁 environments/                  # Environment configurations
│   │       ├── 📄 environment.ts             # Development environment
│   │       └── 📄 environment.prod.ts        # Production environment
│   │
│   └── 📁 assets/                            # Static assets
│       ├── 📁 images/                        # Images
│       └── 📁 icons/                         # Icons
│
├── 📁 node_modules/                          # NPM dependencies (auto-generated)
│
└── 📁 dist/                                  # Build output (auto-generated)
    └── tech-financial-system/

  ---

  ### Login Page For Three Roles

  ---

  <img width="959" height="450" alt="image" src="https://github.com/user-attachments/assets/8994a5a4-a001-4252-92fa-d63f7557c005" />

  ---

  ### Admin Dashboard

  ---

  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/04c0c7a2-6f85-4c08-921e-e287b3b4a275" />
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c253119b-876a-4d94-9e44-b03b027b0b22" />

  ---

  ### Trainer Dashboard

  ---

  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/646a32a0-9714-49e9-b547-72e86a21b7b0" />
  <img width="960" height="451" alt="image" src="https://github.com/user-attachments/assets/dd2ad0e1-0e3b-4cf1-bf74-2f055abfc86d" />


  ---

  ## Client Dashbaord

  ---

  <img width="960" height="441" alt="image" src="https://github.com/user-attachments/assets/0cc66090-d4e7-4dde-a502-5d001ba9263a" />
  <img width="952" height="448" alt="image" src="https://github.com/user-attachments/assets/43347276-1e8f-477d-bfbe-2d6fd48d6d61" />
  



  





  
