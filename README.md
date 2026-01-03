
---

#  College CRM

**Documentation & User Manual**

**Document Version:** 1.0
**Last Updated:** January 2026

---

##  Table of Contents

1. Introduction
2. System Overview
3. User Roles & Access Levels
4. Getting Started
5. Registrar Guide
6. HOD Guide
7. Faculty Guide
8. Common Features
9. Troubleshooting
10. Quick Reference Cards

---

## 1. Introduction

**College CRM** is a comprehensive academic management system designed to streamline:

* Lecture scheduling
* Attendance tracking
* Lecture report management
* Department & faculty coordination

The system follows a **hierarchical role-based structure** with three user roles:

* **Registrar (Administrator)**
* **HOD (Head of Department)**
* **Faculty**

###  Key Features

* Role-based access control with hierarchical permissions
* Daily attendance tracking for all staff
* Lecture scheduling with room conflict detection
* Lecture report submission & review workflow
* Real-time notifications
* Year-wise subject/curriculum management
* Department & faculty management

---

## 2. System Overview

###  Organizational Hierarchy

```
Registrar (Institution Level)
│
├── HOD – Department A
│   ├── Faculty 1
│   ├── Faculty 2
│   └── Faculty 3
│
├── HOD – Department B
│   ├── Faculty 4
│   └── Faculty 5
│
└── HOD – Department C
    └── Faculty 6
```

---

###  Core Workflows

#### Department Setup Flow

Registrar → Creates Department → Assigns HOD →
HOD → Manages Faculty

#### Lecture Workflow

HOD → Schedules Lecture →
Faculty → Receives Notification →
Faculty → Conducts Lecture → Submits Report →
HOD → Reviews Report

#### Attendance Flow

User → Marks Attendance →
HOD → Views Department Attendance →
Registrar → Views Institution Attendance

---

## 3. User Roles & Access Levels

###  Registrar (Administrator)

**Access Level:** Institution-wide

**Responsibilities**

* Create & manage departments
* Assign HOD during department creation
* View attendance across all departments
* Access all lecture reports
* Monitor institution statistics

---

###  HOD (Head of Department)

**Access Level:** Department-specific

**Responsibilities**

* Manage department faculty
* Create year-wise subjects
* Schedule lectures
* Track faculty attendance
* Review lecture reports
* Mark own attendance

---

###  Faculty

**Access Level:** Personal

**Responsibilities**

* View assigned lectures
* Mark daily attendance
* Submit lecture reports
* Apply for leave
* View report history

---

## 4. Getting Started

###  Logging In

1. Open the login page
2. Enter registered email
3. Enter password
4. Select role (Faculty / HOD / Registrar)
5. Click **Sign In**

>  Accounts must be created by a higher authority before login.

---

###  Dashboard Overview

| Role      | Dashboard Shows                  |
| --------- | -------------------------------- |
| Faculty   | Today’s lectures, reports, stats |
| HOD       | Department stats, reports        |
| Registrar | Institution-wide analytics       |

---

###  Sidebar Navigation

| Faculty       | HOD             | Registrar   |
| ------------- | --------------- | ----------- |
| Dashboard     | Dashboard       | Dashboard   |
| Submit Report | Subjects        | Departments |
| Timetable     | Faculty List    | All Reports |
| My Reports    | Lecture Reports | —           |

---

## 5. Registrar Guide

### 5.1 Managing Departments

####  Create Department

1. Sidebar → **Departments**
2. Click **Add Department**
3. Enter:

   * Department Name
   * Department Code
   * HOD Name
   * HOD Email
4. Click **Create**

> ℹ HOD account is auto-created during this step.

---

####  Edit Department

* Departments → Edit icon → Update → Save

####  Delete Department

* Remove all faculty first
* Departments → Delete → Confirm

---

### 5.2 Viewing All Reports

* Sidebar → **All Reports**
* Filters:

  * Search
  * Department
  * Status
* Click  to view details

---

### 5.3 Institution-Wide Attendance

* Dashboard → Attendance Section
* Select date
* View:

  * Present
  * On Leave
  * Not Marked
* Expand department for details

---

### 5.4 Dashboard Statistics

* Total Departments
* Total Reports
* Completed Lectures
* Completion Rate
* Department-wise summary cards

---

## 6. HOD Guide

### 6.1 Managing Faculty

####  Add Faculty

1. Sidebar → **Faculty List**
2. Click **Add Faculty**
3. Enter Name & Email
4. Click **Add Faculty**

---

### 6.2 Managing Subjects

Subjects are **year-wise (1st–4th Year)**

####  Add Subject

* Sidebar → Subjects → Select Year → Add Subject

#### Edit Subject

* Click edit icon → Update

#### Delete Subject

* Click delete icon → Confirm

---

### 6.3 Scheduling Lectures (Timetable)

#### Schedule Lecture

* Year
* Subject
* Faculty
* Date
* Time Slot
* Block
* Room

> Room conflicts are automatically prevented.

---

### 6.4 Reviewing Lecture Reports

* Dashboard → Lecture Reports
* Or Sidebar → Lecture Reports
* Filter by faculty, subject, status

---

### 6.5 Monitoring Attendance

* Dashboard → Faculty Attendance
* Select Date
* View:

  * Present
  * Leave
  * Not Marked

---

### 6.6 Marking Own Attendance

* Dashboard → Attendance Card
* Options:

  * **Present**
  * **Apply Leave**
  * **View History**

---

## 7. Faculty Guide

### 7.1 Dashboard Overview

* Today’s Lectures
* Reports shortcut
* Weekly statistics

---

### 7.2 Submitting Lecture Reports

* Dashboard → Submit Lecture Report
* Select Lecture
* Fill:

  * Topic
  * Duration
  * Status
  * Remarks
* Submit

---

### 7.3 Attendance

* Dashboard → Attendance Card
* Mark **Present** or **Apply Leave**
* View History anytime

---

## 8. Common Features

### Notifications

* Lecture scheduled → Faculty notified
* Report submitted → HOD notified

Access via **Bell Icon**

---

### Attendance Status

* Present
* Leave
* Not Marked

**Best Practice:** Mark attendance daily.

---

### Report Status

* Completed
* Cancelled
* Rescheduled

---

## 9. Troubleshooting

### Common Issues & Fixes

| Issue                    | Solution              |
| ------------------------ | --------------------- |
| Login Failed             | Check role & email    |
| No Subjects              | Add subjects first    |
| Room Unavailable         | Change time/block     |
| Report Submission Failed | Ensure lecture exists |
| Missing Notifications    | Refresh / Clear cache |

---

## 10. Quick Reference Cards

###  Faculty

| Task          | Steps                            |
| ------------- | -------------------------------- |
| Mark Present  | Dashboard → Attendance → Present |
| Apply Leave   | Dashboard → Apply Leave          |
| Submit Report | Dashboard → Submit Report        |
| View Reports  | Dashboard → My Reports           |

---

### HOD

| Task             | Steps                  |
| ---------------- | ---------------------- |
| Add Faculty      | Faculty List → Add     |
| Add Subject      | Subjects → Add         |
| Schedule Lecture | Timetable → Schedule   |
| View Attendance  | Dashboard → Attendance |

---

###  Registrar

| Task            | Steps                  |
| --------------- | ---------------------- |
| Add Department  | Departments → Add      |
| View Reports    | All Reports            |
| View Attendance | Dashboard → Attendance |

---
