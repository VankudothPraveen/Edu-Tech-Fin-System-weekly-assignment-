# 🎓 Tech Financial System - Ed-Tech Platform

A comprehensive financial management system for educational technology platforms that enables seamless coordination between trainers, clients, and administrators with milestone-based training tracking, purchase order management, and automated invoicing.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Angular](https://img.shields.io/badge/Angular-18.0.0-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.2-blue.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [User Roles](#user-roles)
- [Workflow](#workflow)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

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
- **Framework**: Angular 18.0.0
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

## 🏗️ System Architecture
