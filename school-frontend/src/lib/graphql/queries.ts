import { gql } from "@/lib/graphql/gql";

/* ---------- Auth ---------- */

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      id
      username
      role
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      id
      username
      role
    }
  }
`;export const CREATE_STAFF_ACCOUNT = gql`
  mutation CreateStaffAccount($input: RegisterInput!) {
    createStaffAccount(input: $input) {
      id
      username
      role
    }
  }
`;
export const REFRESH_TOKEN = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
      id
      username
      role
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout($input: LogoutInput!) {
    logout(input: $input)
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input)
  }
`;

export const RESEND_VERIFICATION_EMAIL = gql`
  mutation ResendVerificationEmail($input: ResendVerificationInput!) {
    resendVerificationEmail(input: $input)
  }
`;
export const GET_DASHBOARD_COUNTS = gql`
  query DashboardCounts {
    dashboardCounts {
      studentCount
      teacherCount
      parentCount
      adminCount
      boysCount
      girlsCount
    }
  }
`;

export const GET_WEEKLY_ATTENDANCE = gql`
  query WeeklyAttendance {
    weeklyAttendance {
      day
      present
      absent
    }
  }
`;
/* ---------- Subjects ---------- */

export const GET_SUBJECTS = gql`
  query Subjects($search: String, $skip: Float, $take: Float) {
    subjects(search: $search, skip: $skip, take: $take) {
      id
      name
      teachers
    }
  }
`;

export const CREATE_SUBJECT = gql`
  mutation CreateSubject($input: CreateSubjectInput!) {
    createSubject(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_SUBJECT = gql`
  mutation UpdateSubject($id: ID!, $input: UpdateSubjectInput!) {
    updateSubject(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const GET_TEACHER_OPTIONS = gql`
  query TeacherOptions {
    teachers(take: 200) {
      id
      name
    }
  }
`;

/* ---------- Teachers ---------- */

export const GET_TEACHERS = gql`
  query Teachers($search: String, $skip: Float, $take: Float) {
    teachers(search: $search, skip: $skip, take: $take) {
      id
      name
      surname
      email
      phone
      address
      img
      subjects
      subjectIds
      classes
    }
  }
`;

export const GET_TEACHER = gql`
  query Teacher($id: ID!) {
    teacher(id: $id) {
      id
      name
      surname
      email
      phone
      address
      img
      bloodType
      sex
      birthday
      subjects
      subjectIds
      classes
    }
  }
`;
/* ---------- Students ---------- */

export const GET_STUDENTS = gql`
  query Students($search: String, $skip: Float, $take: Float) {
    students(search: $search, skip: $skip, take: $take) {
      id
      name
      surname
      email
      phone
      address
      img
      classId
      className
      gradeId
      gradeLevel
      parentId
      parentName
    }
  }
`;

export const GET_STUDENT = gql`
  query Student($id: ID!) {
    student(id: $id) {
      id
      name
      surname
      email
      phone
      address
      img
      bloodType
      sex
      birthday
      classId
      className
      gradeId
      gradeLevel
      parentId
      parentName
    }
  }
`;

/* ---------- Parents ---------- */

export const GET_PARENTS = gql`
  query Parents($search: String, $skip: Float, $take: Float) {
    parents(search: $search, skip: $skip, take: $take) {
      id
      name
      surname
      email
      phone
      address
      students
    }
  }
`;

/* ---------- Classes ---------- */


export const GET_PARENT_OPTIONS = gql`
  query ParentOptions {
    parents(take: 200) {
      id
      name
    }
  }
`;

export const GET_CLASSES = gql`
  query Classes($search: String, $skip: Float, $take: Float) {
    classes(search: $search, skip: $skip, take: $take) {
      id
      name
      capacity
      gradeLevel
      supervisorName
    }
  }
`;

/* ---------- Lessons ---------- */

export const GET_LESSONS = gql`
  query Lessons($skip: Float, $take: Float) {
    lessons(skip: $skip, take: $take) {
      id
      name
      day
      startTime
      endTime
      subjectName
      className
      teacherName
    }
  }
`;

/* ---------- Exams ---------- */

export const GET_EXAMS = gql`
  query Exams($skip: Float, $take: Float) {
    exams(skip: $skip, take: $take) {
      id
      title
      startTime
      endTime
      subjectName
      className
      teacherName
    }
  }
`;

/* ---------- Assignments ---------- */

export const GET_ASSIGNMENTS = gql`
  query Assignments($skip: Float, $take: Float) {
    assignments(skip: $skip, take: $take) {
      id
      title
      startDate
      dueDate
      subjectName
      className
      teacherName
    }
  }
`;

/* ---------- Results ---------- */

export const GET_RESULTS = gql`
  query Results($skip: Float, $take: Float) {
    results(skip: $skip, take: $take) {
      id
      score
      studentName
      subjectName
      className
      teacherName
      date
      type
    }
  }
`;

/* ---------- Attendance ---------- */

export const GET_ATTENDANCES = gql`
  query Attendances($skip: Float, $take: Float) {
    attendances(skip: $skip, take: $take) {
      id
      dateFormModal.tsx
      present
      studentId
      lessonId
      studentName
      subjectName
      className
      teacherName
    }
  }
`;

/* ---------- Events ---------- */

export const GET_EVENTS = gql`
  query Events($skip: Float, $take: Float) {
    events(skip: $skip, take: $take) {
      id
      title
      description
      startTime
      endTime
      className
    }
  }
`;

/* ---------- Announcements ---------- */

export const GET_ANNOUNCEMENTS = gql`
  query Announcements($skip: Float, $take: Float) {
    announcements(skip: $skip, take: $take) {
      id
      title
      description
      date
      className
    }
  }
`;

/* ---------- Messages ---------- */
export const GET_INBOX = gql`
  query Inbox($skip: Float, $take: Float) {
    inbox(skip: $skip, take: $take) {
      id
      content
      sentAt
      read
      senderId
      receiverId
      senderName
      receiverName
    }
  }
`;

export const GET_CONVERSATION = gql`
  query Conversation($userId: ID!, $skip: Float, $take: Float) {
    conversation(userId: $userId, skip: $skip, take: $take) {
      id
      content
      sentAt
      read
      senderId
      receiverId
      senderName
      receiverName
    }
  }
`;
/* ---------- Profile ---------- */

export const GET_ME = gql`
  query Me {
    me {
      id
      username
      email
      phone
      role
      img
      name
      surname
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      surname
      phone
    }
  }
`;

export const UPDATE_AVATAR = gql`
  mutation UpdateAvatar($input: UpdateAvatarInput!) {
    updateAvatar(input: $input) {
      id
      img
    }
  }
`;

export const GET_USERS = gql`
  query Users($search: String) {
    users(search: $search) {
      id
      username
      roleName
    }
  }
`;

export const MARK_MESSAGE_READ = gql`
  mutation MarkMessageRead($id: ID!) {
    markMessageRead(id: $id) {
      id
      read
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      sentAt
    }
  }
`;

/* ---------- Library ---------- */

export const GET_BOOKS = gql`
  query Books($search: String, $skip: Float, $take: Float) {
    books(search: $search, skip: $skip, take: $take) {
      id
      title
      author
      isbn
      category
      totalCopies
      availableCopies
    }
  }
`;

export const CREATE_BOOK = gql`
  mutation CreateBook($input: CreateBookInput!) {
    createBook(input: $input) {
      id
      title
    }
  }
`;

export const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $input: UpdateBookInput!) {
    updateBook(id: $id, input: $input) {
      id
      title
    }
  }
`;

export const GET_BOOK_LOANS = gql`
  query BookLoans($skip: Float, $take: Float, $status: LoanStatus) {
    bookLoans(skip: $skip, take: $take, status: $status) {
      id
      status
      borrowedAt
      dueDate
      returnedAt
      fineAmount
      bookId
      borrowerId
      bookTitle
      borrowerName
    }
  }
`;

export const ISSUE_BOOK = gql`
  mutation IssueBook($input: IssueBookInput!) {
    issueBook(input: $input) {
      id
      bookTitle
      borrowerName
      dueDate
    }
  }
`;

export const RETURN_BOOK = gql`
  mutation ReturnBook($input: ReturnBookInput!) {
    returnBook(input: $input) {
      id
      status
      fineAmount
    }
  }
`;

// Used by IssueBookForm's borrower picker — combines students and
// teachers into one { id, name, role } list client-side.
export const GET_BORROWER_OPTIONS = gql`
  query BorrowerOptions {
    students(take: 500) {
      userId
      name
      surname
    }
    teachers(take: 500) {
      userId
      name
      surname
    }
  }
`;
export const GET_SCHEDULE = gql`
  query Schedule {
    lessons(take: 500) {
      id
      name
      day
      startTime
      endTime
      subjectName
      teacherId
      classId
    }
  }
`;
export const GET_BOOK_OPTIONS = gql`
  query BookOptions {
    books(take: 500) {
      id
      title
      availableCopies
    }
  }
`;
/* ---------- Fees ---------- */

export const GET_FEE_STRUCTURES = gql`
  query FeeStructures($gradeId: ID) {
    feeStructures(gradeId: $gradeId) {
      id
      name
      amount
      frequency
      gradeId
    }
  }
`;

export const CREATE_FEE_STRUCTURE = gql`
  mutation CreateFeeStructure($input: CreateFeeStructureInput!) {
    createFeeStructure(input: $input) {
      id
    }
  }
`;

export const UPDATE_FEE_STRUCTURE = gql`
  mutation UpdateFeeStructure($id: ID!, $input: UpdateFeeStructureInput!) {
    updateFeeStructure(id: $id, input: $input) {
      id
    }
  }
`;

export const GET_FEE_STRUCTURE_OPTIONS = gql`
  query FeeStructureOptions($gradeId: ID) {
    feeStructures(gradeId: $gradeId) {
      id
      name
      amount
      gradeId
    }
  }
`;

export const GET_INVOICES = gql`
  query Invoices($skip: Float, $take: Float, $status: PaymentStatus, $studentId: ID) {
    invoices(skip: $skip, take: $take, status: $status, studentId: $studentId) {
      id
      period
      amount
      amountPaid
      discountAmount
      discountReason
      fineAmount
      fineReason
      payableAmount
      balance
      dueDate
      status
      studentId
      studentName
    }
  }
`;

export const APPLY_INVOICE_DISCOUNT = gql`
  mutation ApplyInvoiceDiscount($invoiceId: ID!, $input: ApplyDiscountInput!) {
    applyInvoiceDiscount(invoiceId: $invoiceId, input: $input) {
      id
    }
  }
`;

export const APPLY_INVOICE_FINE = gql`
  mutation ApplyInvoiceFine($invoiceId: ID!, $input: ApplyFineInput!) {
    applyInvoiceFine(invoiceId: $invoiceId, input: $input) {
      id
    }
  }
`;

export const GET_SCHOLARSHIPS = gql`
  query Scholarships($studentId: ID) {
    scholarships(studentId: $studentId) {
      id
      name
      type
      value
      active
      startDate
      endDate
      notes
      studentId
       studentName
    }
  }
`;

export const CREATE_SCHOLARSHIP = gql`
  mutation CreateScholarship($input: CreateScholarshipInput!) {
    createScholarship(input: $input) {
      id
    }
  }
`;

export const UPDATE_SCHOLARSHIP = gql`
  mutation UpdateScholarship($id: ID!, $input: UpdateScholarshipInput!) {
    updateScholarship(id: $id, input: $input) {
      id
    }
  }
`;

export const REMOVE_SCHOLARSHIP = gql`
  mutation RemoveScholarship($id: ID!) {
    removeScholarship(id: $id)
  }
`;

export const GENERATE_INVOICE = gql`
  mutation GenerateInvoice($input: GenerateInvoiceInput!) {
    generateInvoice(input: $input) {
      id
    }
  }
`;

export const GENERATE_BULK_INVOICES = gql`
  mutation GenerateBulkInvoices($input: GenerateBulkInvoicesInput!) {
    generateBulkInvoices(input: $input)
  }
`;

export const RECORD_PAYMENT = gql`
  mutation RecordPayment($input: RecordPaymentInput!) {
    recordPayment(input: $input) {
      id
      amount
    }
  }
`;

export const GET_DEFAULTERS = gql`
  query Defaulters($gradeId: ID) {
    defaulters(gradeId: $gradeId) {
      id
      period
      amount
      amountPaid
      balance
      dueDate
      status
      studentName
    }
  }
`;

export const GET_FEE_SUMMARY = gql`
  query FeeCollectionSummary($period: String) {
    feeCollectionSummary(period: $period) {
      totalInvoiced
      totalCollected
      totalPending
      invoiceCount
      paidCount
      overdueCount
    }
  }
`;

export const GET_STUDENT_OPTIONS = gql`
  query StudentOptions {
    students(take: 1000) {
      id
      name
      surname
      className
    }
  }
`;

/* ---------- Teacher Attendance ---------- */

export const GET_TEACHER_ATTENDANCES = gql`
  query TeacherAttendances($date: String, $teacherId: ID, $skip: Float, $take: Float) {
    teacherAttendances(date: $date, teacherId: $teacherId, skip: $skip, take: $take) {
      id
      date
      status
      checkIn
      checkOut
      remarks
      teacherId
      teacherName
    }
  }
`;

export const MARK_TEACHER_ATTENDANCE = gql`
  mutation MarkTeacherAttendance($input: MarkTeacherAttendanceInput!) {
    markTeacherAttendance(input: $input) {
      id
      date
      status
      teacherId
      teacherName
    }
  }
`;

export const BULK_MARK_TEACHER_ATTENDANCE = gql`
  mutation BulkMarkTeacherAttendance($input: BulkMarkTeacherAttendanceInput!) {
    bulkMarkTeacherAttendance(input: $input) {
      id
      date
      status
      teacherId
      teacherName
    }
  }
`;

/* ---------- Staff Attendance ---------- */

export const GET_STAFF_ATTENDANCES = gql`
  query StaffAttendances($date: String, $userId: ID, $skip: Float, $take: Float) {
    staffAttendances(date: $date, userId: $userId, skip: $skip, take: $take) {
      id
      date
      status
      checkIn
      checkOut
      remarks
      userId
      staffName
      staffRole
    }
  }
`;

export const MARK_STAFF_ATTENDANCE = gql`
  mutation MarkStaffAttendance($input: MarkStaffAttendanceInput!) {
    markStaffAttendance(input: $input) {
      id
      date
      status
      userId
      staffName
      staffRole
    }
  }
`;

export const BULK_MARK_STAFF_ATTENDANCE = gql`
  mutation BulkMarkStaffAttendance($input: BulkMarkStaffAttendanceInput!) {
    bulkMarkStaffAttendance(input: $input) {
      id
      date
      status
      userId
      staffName
      staffRole
    }
  }
`;

/* ---------- Leave ---------- */

export const GET_LEAVES = gql`
  query Leaves($status: LeaveStatus, $skip: Float, $take: Float) {
    leaves(status: $status, skip: $skip, take: $take) {
      id
      leaveType
      startDate
      endDate
      reason
      status
      remarks
      appliedAt
      decidedAt
      applicantId
      applicantName
      applicantRole
      approvedById
      approvedByName
    }
  }
`;

export const GET_LEAVE = gql`
  query Leave($id: ID!) {
    leave(id: $id) {
      id
      leaveType
      startDate
      endDate
      reason
      status
      remarks
      appliedAt
      decidedAt
      applicantId
      applicantName
      applicantRole
      approvedById
      approvedByName
    }
  }
`;

export const APPLY_LEAVE = gql`
  mutation ApplyLeave($input: ApplyLeaveInput!) {
    applyLeave(input: $input) {
      id
      leaveType
      startDate
      endDate
      reason
      status
    }
  }
`;

export const DECIDE_LEAVE = gql`
  mutation DecideLeave($input: DecideLeaveInput!) {
    decideLeave(input: $input) {
      id
      status
      remarks
      decidedAt
      approvedByName
    }
  }
`;

export const CANCEL_LEAVE = gql`
  mutation CancelLeave($id: ID!) {
    cancelLeave(id: $id) {
      id
      status
    }
  }
`;

export const GET_TEACHER_ATTENDANCE_OPTIONS = gql`
  query TeacherAttendanceOptions {
    teachers(take: 300) {
      id
      name
      surname
    }
  }
`;

/* ---------- Grades ---------- */

export const GET_GRADES = gql`
  query Grades {
    grades {
      id
      level
    }
  }
`;

export const CREATE_GRADE = gql`
  mutation CreateGrade($input: CreateGradeInput!) {
    createGrade(input: $input) {
      id
      level
    }
  }
`;

export const UPDATE_GRADE = gql`
  mutation UpdateGrade($id: ID!, $input: UpdateGradeInput!) {
    updateGrade(id: $id, input: $input) {
      id
      level
    }
  }
`;

/* ---------- Audit Logs ---------- */

export const GET_AUDIT_LOGS = gql`
  query AuditLogs($skip: Float, $take: Float, $userId: ID, $action: String) {
    auditLogs(skip: $skip, take: $take, userId: $userId, action: $action) {
      id
      userId
      action
      success
      ip
      userAgent
      metadata
      createdAt
    }
  }
`;
export const GET_MY_CHILDREN = gql`
  query MyChildren {
    myChildren {
      id
      name
      surname
      className
    }
  }
`;
/* ---------- Transport ---------- */

export const GET_VEHICLES = gql`
  query Vehicles($skip: Float, $take: Float) {
    vehicles(skip: $skip, take: $take) {
      id
      vehicleNumber
      type
      capacity
      driverName
      route
      status
      transportStaffId
      transportStaffName
    }
  }
`;

export const GET_MY_VEHICLES = gql`
  query MyVehicles {
    myVehicles {
      id
      vehicleNumber
      type
      capacity
      driverName
      route
      status
    }
  }
`;

export const CREATE_VEHICLE = gql`
  mutation CreateVehicle($input: CreateVehicleInput!) {
    createVehicle(input: $input) {
      id
      vehicleNumber
    }
  }
`;

export const UPDATE_VEHICLE = gql`
  mutation UpdateVehicle($id: ID!, $input: UpdateVehicleInput!) {
    updateVehicle(id: $id, input: $input) {
      id
      vehicleNumber
    }
  }
`;
export const GLOBAL_SEARCH = gql`
  query GlobalSearch($query: String!) {
    globalSearch(query: $query) {
      type
      id
      title
      subtitle
      url
    }
  }
`;
export const IMPORT_STUDENTS_CSV = gql`
  mutation ImportStudentsCsv($csv: String!) {
    importStudentsCsv(csv: $csv) {
      created
      failed {
        row
        error
      }
    }
  }
`;
export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      phone
      role
      img
      emailNotifications
      name
      surname
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

export const UPDATE_MY_NOTIFICATION_PREFERENCES = gql`
  mutation UpdateMyNotificationPreferences($input: UpdateNotificationPreferencesInput!) {
    updateMyNotificationPreferences(input: $input) {
      id
      emailNotifications
    }
  }
`;