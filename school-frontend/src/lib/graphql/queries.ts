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
      date
      present
      studentId
      lessonId
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


