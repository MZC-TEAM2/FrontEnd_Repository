# MZC 대학교 LMS API 명세서

## 기본 정보
- **Base URL**: `https://api.mzc-lms.ac.kr/v1`
- **인증 방식**: JWT Bearer Token
- **Content-Type**: `application/json`
- **API 버전**: v1.0.0

## 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { ... }
  }
}
```

## HTTP 상태 코드
- `200 OK`: 요청 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 에러

---

## 1. 인증 API

### 1.1 로그인
```http
POST /auth/login
```

**Request Body**
```json
{
  "email": "202012345@mzc.ac.kr",
  "password": "password123"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "email": "202012345@mzc.ac.kr",
      "userType": "STUDENT",
      "profile": {
        "name": "김학생",
        "studentNumber": "202012345",
        "department": "컴퓨터공학과",
        "year": 3
      }
    }
  }
}
```

### 1.2 토큰 갱신
```http
POST /auth/refresh
```

**Request Body**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 1.3 로그아웃
```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

---

## 2. 사용자 API

### 2.1 내 정보 조회
```http
GET /users/me
Authorization: Bearer {accessToken}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "202012345@mzc.ac.kr",
    "userType": "STUDENT",
    "status": "ACTIVE",
    "profile": {
      "name": "김학생",
      "profileImageUrl": "https://cdn.mzc.ac.kr/profiles/123.jpg",
      "contacts": [
        {
          "type": "MOBILE",
          "value": "010-1234-5678",
          "isPrimary": true
        }
      ]
    },
    "student": {
      "studentNumber": "202012345",
      "admissionYear": 2020,
      "currentYear": 3,
      "academicStatus": "ENROLLED",
      "department": {
        "id": 1,
        "name": "컴퓨터공학과",
        "college": "공과대학"
      }
    }
  }
}
```

### 2.2 프로필 수정
```http
PUT /users/me/profile
Authorization: Bearer {accessToken}
```

**Request Body**
```json
{
  "contacts": [
    {
      "type": "MOBILE",
      "value": "010-9876-5432"
    }
  ]
}
```

### 2.3 프로필 이미지 업로드
```http
POST /users/me/profile-image
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

---

## 3. 수강 과목 API

### 3.1 현재 학기 수강 과목 목록
```http
GET /enrollments/current
Authorization: Bearer {accessToken}
```

**Query Parameters**
- `year`: 학년도 (예: 2024)
- `term`: 학기 (1, 2, SUMMER, WINTER)

**Response**
```json
{
  "success": true,
  "data": {
    "term": {
      "year": 2024,
      "termType": "2",
      "startDate": "2024-09-02",
      "endDate": "2024-12-20"
    },
    "totalCredits": 18,
    "courses": [
      {
        "id": 101,
        "courseCode": "CS301",
        "courseName": "데이터베이스",
        "section": "01",
        "courseType": "MAJOR_REQ",
        "credits": 3,
        "professor": {
          "id": 10,
          "name": "김교수",
          "email": "kim@mzc.ac.kr"
        },
        "schedule": [
          {
            "dayOfWeek": 1,
            "startTime": "09:00",
            "endTime": "10:30",
            "classroom": "공학관 401호"
          },
          {
            "dayOfWeek": 3,
            "startTime": "09:00",
            "endTime": "10:30",
            "classroom": "공학관 401호"
          }
        ],
        "currentWeek": 8,
        "totalWeeks": 16
      }
    ]
  }
}
```

### 3.2 특정 과목 상세 정보
```http
GET /courses/{courseId}
Authorization: Bearer {accessToken}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "courseCode": "CS301",
    "courseName": "데이터베이스",
    "description": "데이터베이스 기본 개념과 SQL을 학습합니다.",
    "syllabus": {
      "objectives": ["데이터베이스 설계", "SQL 작성", "트랜잭션 이해"],
      "textbook": "데이터베이스 시스템 (7판)",
      "grading": {
        "midterm": 30,
        "final": 30,
        "assignment": 20,
        "attendance": 10,
        "participation": 10
      }
    }
  }
}
```

---

## 4. 과제 API

### 4.1 과제 목록 조회
```http
GET /assignments
Authorization: Bearer {accessToken}
```

**Query Parameters**
- `courseId`: 특정 과목의 과제만 조회
- `status`: 상태 필터 (PENDING, SUBMITTED, GRADED)
- `dueDate`: 마감일 필터 (TODAY, THIS_WEEK, OVERDUE)

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 201,
      "courseId": 101,
      "courseName": "데이터베이스",
      "title": "ER 다이어그램 설계",
      "description": "온라인 쇼핑몰 데이터베이스 설계",
      "maxScore": 100,
      "weightPercentage": 5,
      "startDate": "2024-10-01T00:00:00Z",
      "dueDate": "2024-10-15T23:59:59Z",
      "lateSubmissionAllowed": true,
      "submission": {
        "id": 301,
        "submittedAt": "2024-10-14T22:30:00Z",
        "isLate": false,
        "status": "SUBMITTED",
        "grade": null
      },
      "attachments": [
        {
          "id": 1,
          "fileName": "assignment_guide.pdf",
          "fileSize": 524288,
          "downloadUrl": "/assignments/201/attachments/1"
        }
      ]
    }
  ]
}
```

### 4.2 과제 제출
```http
POST /assignments/{assignmentId}/submit
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request Body (Form Data)**
- `contentText`: 텍스트 답안
- `files[]`: 제출 파일들

**Response**
```json
{
  "success": true,
  "data": {
    "submissionId": 302,
    "assignmentId": 201,
    "submittedAt": "2024-10-14T22:30:00Z",
    "isLate": false,
    "files": [
      {
        "id": 401,
        "fileName": "er_diagram.pdf",
        "fileSize": 2097152
      }
    ]
  }
}
```

### 4.3 과제 채점 결과 조회
```http
GET /assignments/{assignmentId}/grade
Authorization: Bearer {accessToken}
```

**Response**
```json
{
  "success": true,
  "data": {
    "submissionId": 301,
    "score": 95,
    "maxScore": 100,
    "finalScore": 95,
    "gradedAt": "2024-10-16T10:00:00Z",
    "gradedBy": "김교수",
    "feedback": {
      "text": "잘 작성했습니다. 정규화 부분만 보완하면 완벽합니다.",
      "attachments": []
    }
  }
}
```

---

## 5. 출석 API

### 5.1 출석 현황 조회
```http
GET /attendance/summary
Authorization: Bearer {accessToken}
```

**Query Parameters**
- `courseId`: 특정 과목 출석만 조회
- `year`: 학년도
- `term`: 학기

**Response**
```json
{
  "success": true,
  "data": {
    "overall": {
      "attendanceRate": 92.5,
      "present": 37,
      "absent": 2,
      "late": 1,
      "excused": 0
    },
    "courses": [
      {
        "courseId": 101,
        "courseName": "데이터베이스",
        "attendanceRate": 95,
        "details": {
          "totalSessions": 20,
          "attended": 19,
          "absent": 1,
          "late": 0,
          "excused": 0
        }
      }
    ]
  }
}
```

### 5.2 출석 체크인
```http
POST /attendance/checkin
Authorization: Bearer {accessToken}
```

**Request Body**
```json
{
  "courseId": 101,
  "sessionId": 501,
  "location": {
    "latitude": 37.123456,
    "longitude": 127.123456
  }
}
```

---

## 6. 시험 API

### 6.1 시험 일정 조회
```http
GET /exams
Authorization: Bearer {accessToken}
```

**Query Parameters**
- `courseId`: 특정 과목 시험만 조회
- `examType`: 시험 유형 (MIDTERM, FINAL, QUIZ)
- `status`: 상태 (UPCOMING, COMPLETED)

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 601,
      "courseId": 101,
      "courseName": "데이터베이스",
      "examName": "중간고사",
      "examType": "MIDTERM",
      "examDate": "2024-10-20T10:00:00Z",
      "duration": 90,
      "location": "공학관 301호",
      "maxScore": 100,
      "status": "UPCOMING"
    }
  ]
}
```

### 6.2 시험 성적 조회
```http
GET /exams/{examId}/score
Authorization: Bearer {accessToken}
```

**Response**
```json
{
  "success": true,
  "data": {
    "examId": 601,
    "score": 85,
    "maxScore": 100,
    "rank": 15,
    "totalStudents": 60,
    "average": 72.5,
    "gradedAt": "2024-10-25T15:00:00Z"
  }
}
```

---

## 7. 성적 API

### 7.1 전체 성적 조회
```http
GET /grades
Authorization: Bearer {accessToken}
```

**Query Parameters**
- `year`: 학년도
- `term`: 학기

**Response**
```json
{
  "success": true,
  "data": {
    "term": {
      "year": 2024,
      "termType": "1"
    },
    "summary": {
      "totalCredits": 18,
      "averageGPA": 3.75,
      "totalGPA": 3.65
    },
    "courses": [
      {
        "courseCode": "CS201",
        "courseName": "자료구조",
        "credits": 3,
        "grade": "A",
        "gradePoint": 4.0,
        "details": {
          "midterm": 88,
          "final": 92,
          "assignment": 95,
          "attendance": 100,
          "total": 91.5
        }
      }
    ]
  }
}
```

---

## 8. 강의 자료 API

### 8.1 강의 자료 목록
```http
GET /courses/{courseId}/materials
Authorization: Bearer {accessToken}
```

**Query Parameters**
- `week`: 특정 주차 자료만 조회
- `type`: 자료 유형 (LECTURE, LAB, REFERENCE)

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 701,
      "title": "5주차 - SQL 기초",
      "weekNumber": 5,
      "type": "LECTURE",
      "isVisible": true,
      "uploadedAt": "2024-09-30T09:00:00Z",
      "files": [
        {
          "id": 801,
          "fileName": "week5_sql_basics.pdf",
          "fileSize": 3145728,
          "downloadUrl": "/materials/701/files/801",
          "downloadCount": 45
        }
      ]
    }
  ]
}
```

### 8.2 강의 자료 다운로드
```http
GET /materials/{materialId}/files/{fileId}
Authorization: Bearer {accessToken}
```

---

## 9. 공지사항 API

### 9.1 공지사항 목록
```http
GET /notices
Authorization: Bearer {accessToken}
```

**Query Parameters**
- `courseId`: 특정 과목 공지만 조회
- `isImportant`: 중요 공지만 조회

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 901,
      "courseId": 101,
      "courseName": "데이터베이스",
      "title": "중간고사 일정 안내",
      "isImportant": true,
      "viewCount": 156,
      "author": "김교수",
      "createdAt": "2024-10-01T10:00:00Z",
      "content": "중간고사는 10월 20일 오전 10시입니다...",
      "attachments": []
    }
  ]
}
```

### 9.2 공지사항 상세 조회
```http
GET /notices/{noticeId}
Authorization: Bearer {accessToken}
```

---

## 10. 시간표 API

### 10.1 내 시간표 조회
```http
GET /schedule
Authorization: Bearer {accessToken}
```

**Query Parameters**
- `year`: 학년도
- `term`: 학기

**Response**
```json
{
  "success": true,
  "data": {
    "term": {
      "year": 2024,
      "termType": "2"
    },
    "schedule": [
      {
        "dayOfWeek": 1,
        "courses": [
          {
            "courseId": 101,
            "courseCode": "CS301",
            "courseName": "데이터베이스",
            "professor": "김교수",
            "startTime": "09:00",
            "endTime": "10:30",
            "classroom": "공학관 401호",
            "color": "#6FA3EB"
          },
          {
            "courseId": 102,
            "courseCode": "CS302",
            "courseName": "알고리즘",
            "professor": "이교수",
            "startTime": "13:00",
            "endTime": "14:30",
            "classroom": "공학관 302호",
            "color": "#A5C9EA"
          }
        ]
      }
    ]
  }
}
```

---

## 11. 학사 일정 API

### 11.1 학사 일정 조회
```http
GET /academic-calendar
Authorization: Bearer {accessToken}
```

**Query Parameters**
- `year`: 학년도
- `month`: 특정 월

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "title": "중간고사 기간",
      "startDate": "2024-10-21",
      "endDate": "2024-10-25",
      "type": "EXAM",
      "isHoliday": false
    },
    {
      "id": 1002,
      "title": "수강신청 정정기간",
      "startDate": "2024-09-09",
      "endDate": "2024-09-13",
      "type": "REGISTRATION",
      "isHoliday": false
    }
  ]
}
```

---

## 12. 대시보드 통계 API

### 12.1 대시보드 요약 정보
```http
GET /dashboard/summary
Authorization: Bearer {accessToken}
```

**Response**
```json
{
  "success": true,
  "data": {
    "currentTerm": {
      "year": 2024,
      "termType": "2",
      "week": 8
    },
    "statistics": {
      "enrolledCourses": 6,
      "totalCredits": 18,
      "pendingAssignments": 3,
      "upcomingExams": 2,
      "attendanceRate": 92.5,
      "currentGPA": 3.75
    },
    "recentActivities": [
      {
        "type": "ASSIGNMENT_SUBMITTED",
        "title": "데이터베이스 과제 #3 제출",
        "timestamp": "2024-10-14T22:30:00Z"
      }
    ],
    "upcomingSchedule": [
      {
        "type": "EXAM",
        "title": "데이터베이스 중간고사",
        "datetime": "2024-10-15T10:00:00Z"
      }
    ]
  }
}
```

---

## 에러 코드

| 코드 | 설명 |
|------|------|
| `AUTH_001` | 인증 토큰이 없거나 유효하지 않음 |
| `AUTH_002` | 토큰이 만료됨 |
| `AUTH_003` | 권한이 없음 |
| `USER_001` | 사용자를 찾을 수 없음 |
| `USER_002` | 잘못된 비밀번호 |
| `COURSE_001` | 과목을 찾을 수 없음 |
| `COURSE_002` | 수강 신청되지 않은 과목 |
| `ASSIGNMENT_001` | 과제를 찾을 수 없음 |
| `ASSIGNMENT_002` | 제출 기한이 지남 |
| `ASSIGNMENT_003` | 이미 제출됨 |
| `FILE_001` | 파일 크기 초과 |
| `FILE_002` | 허용되지 않는 파일 형식 |

---

## Rate Limiting

- 일반 API: 분당 60회
- 인증 API: 분당 10회
- 파일 업로드: 시간당 100회

초과 시 `429 Too Many Requests` 응답과 함께 `X-RateLimit-Reset` 헤더에 리셋 시간 포함

---

## Webhook Events (선택적)

과제 제출, 성적 등록 등의 이벤트 발생 시 등록된 엔드포인트로 알림

### Event Types
- `assignment.created` - 새 과제 등록
- `assignment.graded` - 과제 채점 완료
- `exam.scheduled` - 시험 일정 등록
- `grade.posted` - 성적 공개
- `notice.created` - 새 공지사항

### Webhook Payload
```json
{
  "event": "assignment.graded",
  "timestamp": "2024-10-16T10:00:00Z",
  "data": {
    "assignmentId": 201,
    "studentId": 1,
    "score": 95
  }
}
```