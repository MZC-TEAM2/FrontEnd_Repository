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

### 3.3 n주차 목록 조회

```http
GET /courses/{courseId}/weeks
Authorization: Bearer {accessToken}
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "weekNumber": 1,
      "weekTitle": "1주차: 데이터베이스 개요",
      "contents": [
        {
          "id": 2001,
          "contentType": "VIDEO",
          "title": "데이터베이스 시스템의 개념",
          "contentUrl": "https://video.mzc.ac.kr/courses/101/week1/lecture1.mp4",
          "duration": "45:23",
          "progress": {
            "isCompleted": true,
            "progressPercentage": 100,
            "lastPositionSeconds": 2723,
            "completedAt": "2024-09-03T14:30:00Z",
            "firstAccessedAt": "2024-09-03T13:00:00Z",
            "lastAccessedAt": "2024-09-03T14:30:00Z",
            "accessCount": 2
          }
        }
      ]
    }
  ]
}
```

### 3.4 콘텐츠 진행 상황 업데이트
```http
PUT /contents/{contentId}/progress
Authorization: Bearer {accessToken}
```

**Request Body**
```json
{
  "progressPercentage": 75,
  "lastPositionSeconds": 2000
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "contentId": 2002,
    "isCompleted": false,
    "progressPercentage": 75,
    "lastPositionSeconds": 2000,
    "firstAccessedAt": "2024-09-04T09:00:00Z",
    "lastAccessedAt": "2024-10-15T14:30:00Z",
    "accessCount": 4
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

## 9. 수강신청 API 

### 9.1 수강신청 기간 조회
```http
GET /api/v1/enrollment/periods/current
Authorization: Bearer {accessToken}
```

**Response**
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "currentPeriod": {
      "id": 1,
      "term": {
        "year": 2024,
        "termType": "2",
        "termName": "2025학년도 2학기"
      },
      "periodName": "1차 수강신청",
      "startDatetime": "2025-08-15T10:00:00Z",
      "endDatetime": "2025-08-17T18:00:00Z",
      "targetYear": null,
      "remainingTime": {
        "days": 1,
        "hours": 5,
        "minutes": 30,
        "totalSeconds": 105000
      }
    }
  }
}
```

### 9.2 수강신청 기간 중 강의 목록 조회

### 강의 목록 조회 (검색 및 필터링)
```http
GET /api/v1/enrollment/courses
Authorization: Bearer {accessToken}
```

**Query Parameters**
- `page`: 페이지 번호 (기본값: 0)
- `size`: 페이지 크기 (기본값: 20)
- `keyword`: 검색어 (과목명, 과목코드, 교수명 통합 검색)
- `departmentId`: 학과 ID (전체: null)
- `courseType`: 이수구분 (전체: null, 값: MAJOR_REQ, MAJOR_ELEC, GEN_REQ, GEN_ELEC)
- `credits`: 학점 (전체: null, 값: 1, 2, 3, 4)
- `termId`: 학기 ID (필수)
- `sort`: 정렬 (기본값: courseCode,asc)

**Request Example**
```
GET /api/v1/enrollment/courses?page=0&size=20&keyword=데이터베이스&departmentId=1&courseType=MAJOR_REQ&credits=3&termId=10&sort=courseCode,asc
```

**Response**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 101,
        "courseCode": "CS301",
        "courseName": "데이터베이스",
        "section": "01",
        "professor": {
          "id": 10,
          "name": "김교수"
        },
        "department": {
          "id": 1,
          "name": "컴퓨터공학과"
        },
        "credits": 3,
        "courseType": {
          "code": "MAJOR_REQ",
          "name": "전공필수",
          "color": "#FFB4C8"
        },
        "schedule": [
          {
            "dayOfWeek": 1,
            "dayName": "월",
            "startTime": "09:10",
            "endTime": "10:30",
            "classroom": "공학관 401호"
          },
          {
            "dayOfWeek": 4,
            "dayName": "목",
            "startTime": "09:10",
            "endTime": "10:30",
            "classroom": "공학관 401호"
          }
        ],
        "scheduleText": "월 9-10:30, 목 9-10:30\n공학관 401호",
        "enrollment": {
          "current": 35,
          "max": 40,
          "isFull": false,
          "availableSeats": 5
        },
        "isInCart": false,
        "isEnrolled": false,
        "canEnroll": true,
        "warnings": []
      }
    ]
  }
}
```

### 9.3 수강신청 장바구니 조회
```http
GET /api/v1/cart
Authorization: Bearer {accessToken}
```
**Response**
```json
{
  "success": true,
  "data": {
    "totalCourses": 1,
    "totalCredits": 3,
    "courses": [
      {
        "cartId": 1,
        "course": {
          "id": 101,
          "code": "CS301",
          "name": "데이터베이스",
          "section": "01",
          "credits": 3,
          "courseType": "전공필수"
        },
        "professor": {
          "id": 10,
          "name": "김교수"
        },
        "schedule": [
          {
            "dayOfWeek": 1,
            "startTime": "10:30",
            "endTime": "12:00",
            "classroom": "공학관 301호"
          },
          {
            "dayOfWeek": 3,
            "startTime": "10:30",
            "endTime": "12:00",
            "classroom": "공학관 301호"
          }
        ],
        "enrollment": {
          "current": 45,
          "max": 45,
          "isFull": true
        },
        "addedAt": "2024-08-15T14:30:00Z"
      }
    ]
  }
}
```

## 9.4 수강신청 장바구니에 강의 추가
```http
POST /api/v1/cart/bulk
Authorization: Bearer {accessToken}
```

**Request Body**
```json
{
  "courseIds": [102, 103, 104]
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalAttempted": 2,
      "successCount": 2,
      "failedCount": 0
    },
    "succeeded": [
      {
        "cartId": 5,
        "courseId": 102,
        "courseCode": "CS302",
        "courseName": "알고리즘",
        "credits": 3,
        "addedAt": "2024-08-16T10:30:00Z"
      },
      {
        "cartId": 6,
        "courseId": 104,
        "courseCode": "CS402",
        "courseName": "소프트웨어공학",
        "credits": 3,
        "addedAt": "2024-08-16T10:30:01Z"
      }
    ]
  }
}
```
**검증 순서**
1. 수강신청 기간 체크
2. 과목 존재 여부 체크
3. 이미 장바구니에 있는지 체크
4. 이미 수강신청했는지 체크
5. 동일 과목 다른 분반 체크
6. 선수과목 이수 여부 체크
7. 학점 제한 체크
8. 시간표 충돌 체크

**주의사항**
1. 정원초과가 되어도 장바구니엔 추가할 수 있음 (실제 수강신청시엔 실패할 수 있음)
2. 수강신청은 부분실패를 허용하나 장바구니는 전체성공, 전체실패만 존재
3. 수강신청 성공시 장바구니에서 해당 과목 제거

### 9.5 장바구니에서 강의 제거
```http
DELETE /api/v1/cart/bulk
Authorization: Bearer {accessToken}
```

**Request Body**
```json
{
  "cartIds": [5, 6, 7]
}
```

**Response - 성공**
```json
{
  "success": true,
  "data": {
    "removedCount": 1,
    "removedCredits": 3,
    "removedCourses": [
      {
        "cartId": 1,
        "courseCode": "CS301",
        "courseName": "데이터베이스",
        "credits": 3
      }
    ]
  }
}
```

**Error Codes**
| 코드 | 설명 | HTTP Status |
|------|------|-------------|
| `CART_ITEM_NOT_FOUND` | 장바구니 항목을 찾을 수 없음 | 404 |
| `COURSE_NOT_IN_CART` | 장바구니에 없는 과목 | 404 |
| `CART_ACCESS_DENIED` | 다른 사용자의 장바구니 | 403 |
| `CART_ALREADY_EMPTY` | 이미 비어있는 장바구니 | 400 |

### 9.6 장바구니 전체 제거
```http
DELETE /api/v1/cart
Authorization: Bearer {accessToken}
```
**Response**
```json
{
  "success": true,
  "data": {
    "removedCount": 1,
    "removedCredits": 3,
    "removedCourses": [
      {
        "cartId": 1,
        "courseCode": "CS301",
        "courseName": "데이터베이스",
        "credits": 3
      }
    ],
    "clearedAt": "2024-08-16T11:30:00Z"
  },
  "message": "장바구니가 비워졌습니다"
}
```

### 9.6 수강신청 
```http
POST /api/v1/enrollment/cart
Authorization: Bearer {accessToken}
```

**Request Body**
```json
{
  "courseIds": [101, 102, 103, 104, 105]
}
```
**Response - 부분 성공**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalAttempted": 2,
      "successCount": 1,
      "failedCount": 1,
      "enrolledCredits": 3,
      "totalCredits": 6
    },
    "succeeded": [
      {
        "enrollmentId": 201,
        "courseId": 102,
        "courseCode": "CS302",
        "courseName": "알고리즘",
        "section": "01",
        "credits": 3,
        "enrolledAt": "2024-08-17T10:00:00.123Z"
      }
    ],
    "failed": [
      {
        "courseId": 101,
        "courseCode": "CS301",
        "courseName": "데이터베이스",
        "section": "01",
        "errorCode": "COURSE_FULL",
        "message": "수강 정원이 마감되었습니다",
        "enrollment": {
          "current": 45,
          "max": 45
        }
      }
    ]
  },
  "message": "3개 과목 수강신청 완료, 2개 과목 실패"
}
```

**Error Codes**
| 코드 | 설명 | HTTP Status |
|------|------|-------------|
| `COURSE_FULL` | 수강 정원 초과 | 400 |
| `TIME_CONFLICT` | 시간표 충돌 | 400 |
| `CREDIT_LIMIT_EXCEEDED` | 학점 초과 | 400 |
| `PREREQUISITE_NOT_MET` | 선수과목 미이수 | 400 |
| `ALREADY_ENROLLED` | 이미 수강신청함 | 400 |
| `DUPLICATE_SUBJECT` | 동일 과목 다른 분반 이미 신청 | 400 |
| `ENROLLMENT_PERIOD_CLOSED` | 수강신청 기간 아님 | 400 |
| `CANCELLATION_PERIOD_CLOSED` | 취소 가능 기간 아님 | 400 |
| `ENROLLMENT_NOT_FOUND` | 수강신청 내역 없음 | 404 |
| `ENROLLMENT_ACCESS_DENIED` | 권한 없음 | 403 |
| `COURSE_NOT_FOUND` | 과목을 찾을 수 없음 | 404 |

**수강신청 처리 순서**
1. 수강신청 기간 체크
2. 과목 존재 여부 체크
3. 정원 체크 (동시성 제어)
4. 이미 수강신청했는지 체크
5. 동일 과목 다른 분반 체크
6. 시간표 충돌 체크
7. 선수과목 이수 여부 체크
8. 학점 제한 체크
9. 수강신청 처리
10. 장바구니에서 제거 (있는 경우)

**취소 가능 기간**
- 수강신청 기간: 취소 가능
- 정정기간: 취소 가능
- 수강철회기간: 취소 가능
- 그 외: 취소 불가

**동시성 제어**
- 정원 체크와 수강신청 사이에 낙관적 락(Optimistic Lock) 또는 비관적 락(Pessimistic Lock) 사용
- 동시에 여러 학생이 신청해도 정원 초과 방지

**참고사항**
- 장바구니에서 일괄 수강신청 시 부분 성공 허용
- 수강신청 성공 시 자동으로 장바구니에서 제거
- 취소 시 학점이 복구되어 다른 과목 신청 가능
- 수강신청 내역은 학기별로 관리

### 9.7 수강신청 취소
```http
DELETE /api/v1/enrollment/bulk
Authorization: Bearer {accessToken}
```

**Request Body (enrollmentId로)**
```json
{
  "enrollmentIds": [201, 202, 203]
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalAttempted": 2,
      "successCount": 1,
      "failedCount": 1
    },
    "cancelled": [
      {
        "enrollmentId": 201,
        "courseId": 102,
        "courseCode": "CS302",
        "courseName": "알고리즘",
        "credits": 3,
        "cancelledAt": "2024-08-16T14:30:00Z"
      }
    ],
    "failed": [
      {
        "enrollmentId": 203,
        "courseId": 105,
        "errorCode": "ENROLLMENT_NOT_FOUND",
        "message": "수강신청 내역을 찾을 수 없습니다"
      }
    ],
    "enrollmentSummary": {
      "totalCourses": 4,
      "totalCredits": 12
    }
  },
  "message": "1개 과목 취소 완료, 1개 과목 실패"
}
```

### 9.8 수강신청 목록 조회
```http
GET /api/v1/enrollment/my
Authorization: Bearer {accessToken}
```
**Query Parameters**
- `termId`: 학기 ID (선택, 미입력시 현재 학기)

**Response**
```json
{
  "success": true,
  "data": {
    "term": {
      "id": 10,
      "year": 2025,
      "termType": "2",
      "termName": "2025학년도 2학기"
    },
    "summary": {
      "totalCourses": 1,
      "totalCredits": 3,
      "maxCredits": 21,
      "remainingCredits": 18
    },
    "enrollments": [
      {
        "enrollmentId": 201,
        "course": {
          "id": 102,
          "courseCode": "CS302",
          "courseName": "알고리즘",
          "section": "01",
          "credits": 3,
          "courseType": {
            "code": "MAJOR_REQ",
            "name": "전공필수"
          }
        },
        "professor": {
          "id": 11,
          "name": "이교수"
        },
        "schedule": [
          {
            "dayOfWeek": 1,
            "dayName": "화",
            "startTime": "09:00",
            "endTime": "12:00",
            "classroom": "공학관 302호"
          }
        ],
        "enrolledAt": "2024-08-16T10:00:00Z",
        "canCancel": true
      }
    ]
  }
}
```

## 10. 공지사항 API

### 10.1 공지사항 목록
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

### 10.2 공지사항 상세 조회
```http
GET /notices/{noticeId}
Authorization: Bearer {accessToken}
```

---

## 11. 시간표 API

### 11.1 내 시간표 조회
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

## 12. 학사 일정 API

### 12.1 학사 일정 조회
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

## 13. 대시보드 통계 API

### 13.1 대시보드 요약 정보
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
| `COURSE_002` | 수강신청되지 않은 과목 |
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