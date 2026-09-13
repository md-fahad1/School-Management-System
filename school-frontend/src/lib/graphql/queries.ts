import { gql } from "graphql-request";

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
      className
      gradeLevel
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
      gradeLevel
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

export const GET_GRADES = gql`
  query Grades {
    grades {
      id
      level
    }
  }
`;

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
      balance
      dueDate
      status
      studentId
      studentName
    }
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