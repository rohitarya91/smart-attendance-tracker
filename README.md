# smart-attendance-tracker
AI-Assisted Smart Attendance &amp; Performance Tracker

**@ Dashboard Overview**

Description:

This is the main dashboard of the EduTrack AI system. It provides a quick summary of key academic metrics such as total number of students, average attendance percentage, average performance score, and students who are at academic risk.

The dashboard also displays a Recent Activity section, which logs real-time actions like adding new students and marking attendance. This helps faculty quickly monitor daily updates and system usage.

Key Highlights:

Total Students count

Average Attendance (AI-calculated)

Average Performance score

At-Risk student indicator

Real-time activity tracking

**@ Student Management – Student List**

Description:

This screen shows the Student Management section where all registered students are displayed in a structured table format. Each record includes roll number, student name, and semester.

Faculty can easily search, edit, or delete student records using the action buttons. This replaces manual registers and Excel sheets, ensuring better accuracy and organization.

Key Highlights:

Student list with roll number, name, semester

Search functionality

Edit and delete options

Clean and readable table layout

**@ Attendance Management**

Description:

This screen is used to mark attendance for students. Faculty can select a student from the dropdown list and mark them as Present or Absent.

The system automatically stores attendance data and later uses it to calculate attendance percentage and identify attendance shortages using AI-assisted logic.

Key Highlights:

Student selection dropdown

Present / Absent option

One-click attendance marking

Data stored for analytics

** @Performance Management – Enter Marks**

Description:

This section allows faculty to enter marks for a selected student and subject. Marks are validated (0–100) and stored for performance analysis.

The interface is simple and user-friendly, ensuring quick data entry during internal assessments.

Key Highlights:

Student selection

Subject input

Marks validation

Save marks functionality

**@ Add New Student (Popup Modal)**

Description:

This popup form is used to add new students to the system. It collects essential information such as roll number, full name, and semester.

AI-assisted validation ensures duplicate roll numbers are not allowed, maintaining data integrity.

Key Highlights:

Modal-based clean UI

Roll number validation

Quick student registration

Error-free data entry

**@ AI Performance Analysis**

Description:

This screen displays AI-generated performance analysis for a selected student. Based on the marks entered, the system automatically calculates the score, assigns a grade, and generates performance remarks.

This feature demonstrates the use of AI logic for academic insights without requiring complex backend systems.

Performance Logic Example:

75% and above → Good

50%–74% → Average

Below 50% → Needs Improvement

Key Highlights:

Auto grade calculation

AI-generated remarks

Clear performance summary

Faculty-friendly insights

**@ AI-Assisted Features Used**

Roll number duplication validation

Automatic attendance percentage calculation

Attendance shortage warning (below 75%)

Auto-generated performance remarks

Real-time academic insights

**@ Technologies Used**

HTML – Structure

CSS – Modern dark UI & responsiveness

JavaScript – Logic, validation, AI rules

LocalStorage – Data persistence (no backend)
