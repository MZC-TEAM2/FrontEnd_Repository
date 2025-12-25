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
        "quiz": 10,
        "assignment": 20,
        "attendance": 10
      }
    }
  }
}
```

### 3.3 n주차 목록 조회

```http
GET /api/v1/courses/{courseId}/weeks
Authorization: Bearer {accessToken}
```

**권한**

- 수강 중인 학생 또는 해당 강의 담당 교수

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
          "order": 1,
          "createdAt": "2024-09-01T10:00:00Z"
        },
        {
          "id": 2002,
          "contentType": "DOCUMENT",
          "title": "강의노트 - 1주차",
          "contentUrl": "https://files.mzc.ac.kr/courses/101/week1/notes.pdf",
          "order": 2,
          "createdAt": "2024-09-01T10:05:00Z"
        }
      ],
      "createdAt": "2024-09-01T09:00:00Z"
    },
    {
      "id": 1002,
      "weekNumber": 2,
      "weekTitle": "2주차: ER 다이어그램",
      "contents": [],
      "createdAt": "2024-09-05T14:00:00Z"
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

### 6.1 시험/퀴즈 목록 조회 (학생)

```http
GET /api/v1/exams?courseId={courseId}&examType={examType}
Authorization: Bearer {accessToken}
```

**Query Parameters**

- `courseId`: 특정 강의의 시험/퀴즈만 조회
- `examType`: 유형 (MIDTERM, FINAL, REGULAR, QUIZ)

**정책**

- 학생은 **수강 중인 강의(courseId)**만 조회 가능
- 학생은 **시작시간(startAt) 이전**의 시험/퀴즈는 **목록에서 제외**됨

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 601,
      "courseId": 101,
      "type": "QUIZ",
      "title": "1주차 퀴즈",
      "startAt": "2024-10-20T10:00:00Z",
      "endAt": "2024-10-20T10:15:00Z",
      "durationMinutes": 15,
      "totalScore": 100,
      "isOnline": true,
      "location": "온라인"
    }
  ]
}
```

### 6.2 시험/퀴즈 상세 조회 (학생)

```http
GET /api/v1/exams/{examId}
Authorization: Bearer {accessToken}
```

**정책**

- 학생은 **수강 중인 강의**만 조회 가능
- 학생은 **시작시간 이전**에는 조회 불가(400)
- 문제 데이터는 DB의 `exams.question_data`에 저장되며, 학생 응답에서는 **정답(`correctChoiceIndex`)이 마스킹**됨

**Response**

```json
{
  "success": true,
  "data": {
    "id": 601,
    "postId": 9001,
    "courseId": 101,
    "type": "QUIZ",
    "title": "1주차 퀴즈",
    "content": "1주차 학습 내용 퀴즈입니다.",
    "startAt": "2024-10-20T10:00:00Z",
    "endAt": "2024-10-20T10:15:00Z",
    "durationMinutes": 15,
    "totalScore": 100,
    "isOnline": true,
    "location": "온라인",
    "instructions": "제한시간 내 제출하세요.",
    "questionCount": 10,
    "passingScore": 60,
    "questionData": {
      "questions": [
        {
          "id": "q1",
          "type": "MCQ",
          "prompt": "다음 중 옳은 것은?",
          "choices": ["A", "B", "C", "D"],
          "points": 10
        }
      ]
    }
  }
}
```

### 6.3 응시 시작 (학생)

```http
POST /api/v1/exams/{examId}/start
Authorization: Bearer {accessToken}
```

**정책**

- 중복 응시 방지: 이미 제출(`submittedAt` 존재)한 경우 시작 불가
- 종료된 시험/퀴즈는 신규 응시 시작 불가

**Response**

```json
{
  "success": true,
  "data": {
    "attemptId": 7001,
    "startedAt": "2024-10-20T10:00:05Z",
    "endAt": "2024-10-20T10:15:05Z",
    "remainingSeconds": 895
  }
}
```

### 6.4 최종 제출 (학생)

```http
POST /api/v1/exams/results/{attemptId}/submit
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body**

```json
{
  "answers": {
    "q1": 1,
    "q2": "Spring Boot는 ..."
  }
}
```

**정책**

- 임시저장(autosave) 기능은 제공하지 않음(제출 시점에만 `answer_data` 저장)
- **퀴즈(QUIZ)**: 제출 즉시 **자동채점**하여 `score` 반환/저장
- **시험(MIDTERM/FINAL/REGULAR)**: 제출 시점에 **즉시 채점하지 않음** (`score=null` 유지), 교수 채점 API로 점수 확정
- 지각 제출(late) 정책:
	- 마감시간(응시 종료 시각) 이후 **10분까지는 제출 허용**하며 **10% 감점** 정보를 저장 (`latePenaltyRate = 0.10`)
	- 마감시간 이후 **10분이 초과되면 제출 자체가 불가**(400)

**Response**

```json
{
  "success": true,
  "data": {
    "attemptId": 7001,
    "submittedAt": "2024-10-20T10:16:00Z",
    "isLate": true,
    "latePenaltyRate": 0.10,
    "score": 81.00
  }
}
```

### 6.5 시험/퀴즈 등록 (교수)

```http
POST /api/v1/boards/{boardType}/exams
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameter**

- `boardType`: `QUIZ` 또는 `EXAM`

**정책**

- 교수 권한 필요(`PROFESSOR`)
- 정합성 규칙:
	- `boardType=QUIZ`이면 `type=QUIZ`만 허용
	- `boardType=EXAM`이면 `type=QUIZ`는 허용하지 않음
- 문제/정답 JSON은 `questionData`로 전달되며 DB의 `exams.question_data`에 저장
- 퀴즈(`type=QUIZ`)는 **객관식(MCQ) 문항만 허용**

**Request Body**

```json
{
  "courseId": 101,
  "title": "1주차 퀴즈",
  "content": "1주차 학습 내용 퀴즈입니다.",
  "type": "QUIZ",
  "startAt": "2024-10-20T10:00:00",
  "durationMinutes": 15,
  "totalScore": 100,
  "isOnline": true,
  "location": "온라인",
  "instructions": "제한시간 내 제출하세요.",
  "questionCount": 10,
  "passingScore": 60,
  "questionData": {
    "questions": [
      {
        "id": "q1",
        "type": "MCQ",
        "prompt": "다음 중 옳은 것은?",
        "choices": ["A", "B", "C", "D"],
        "correctChoiceIndex": 1,
        "points": 10
      }
    ]
  }
}
```

```json
{
  "courseId": 101,
  "title": "중간고사",
  "content": "중간고사 안내 및 시험 범위입니다.",
  "type": "MIDTERM",
  "startAt": "2024-10-30T09:00:00",
  "durationMinutes": 90,
  "totalScore": 100,
  "isOnline": false,
      "location": "공학관 301호",
  "instructions": "주관식은 문장으로 작성하세요.",
  "questionCount": 3,
  "passingScore": 60,
  "questionData": {
    "questions": [
      {
        "id": "q1",
        "type": "SUBJECTIVE",
        "prompt": "정규화(1NF~3NF)의 목적과 각 정규형의 조건을 설명하시오.",
        "points": 40
      },
      {
        "id": "q2",
        "type": "MCQ",
        "prompt": "다음 중 트랜잭션 격리 수준이 아닌 것은?",
        "choices": ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"],
        "correctChoiceIndex": 2,
        "points": 30
      },
      {
        "id": "q3",
        "type": "SUBJECTIVE",
        "prompt": "인덱스의 장단점과, 어떤 경우에 인덱스가 오히려 성능을 떨어뜨릴 수 있는지 서술하시오.",
        "points": 30
    }
  ]
  }
}
```

### 6.6 시험/퀴즈 수정 (교수)

```http
PUT /api/v1/exams/{examId}/edit
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### 6.7 시험/퀴즈 삭제 (교수)

```http
DELETE /api/v1/exams/{examId}/delete
Authorization: Bearer {accessToken}
```

### 6.7.1 시험 채점 (교수)

```http
PUT /api/v1/exams/results/{attemptId}/grade
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**정책**

- 교수 권한 필요(`PROFESSOR`)
- 퀴즈는 자동채점이므로 본 API 대상이 아님
- 시험 점수는 교수 입력 후, 지각인 경우 `latePenaltyRate`만큼 감점 적용되어 저장됨

**Request Body**

```json
{
  "score": 90,
  "feedback": "채점 완료"
}
```

### 6.8 시험/퀴즈 목록 조회 (교수)

```http
GET /api/v1/professor/exams?courseId={courseId}&examType={examType}
Authorization: Bearer {accessToken}
```

**정책**

- 교수 권한 필요(`PROFESSOR`)
- 본인 강의(courseId)만 조회 가능
- 교수는 **시작 전 항목도 포함**해서 조회 가능(미리보기)

### 6.9 시험/퀴즈 상세 조회 (교수)

```http
GET /api/v1/professor/exams/{examId}
Authorization: Bearer {accessToken}
```

**정책**

- 교수 권한 필요(`PROFESSOR`)
- 본인 강의만 조회 가능
- `questionData`는 **정답 포함 원본** 제공

### 6.10 응시자/응시 결과 목록 조회 (교수)

```http
GET /api/v1/professor/exams/{examId}/attempts?status={status}
Authorization: Bearer {accessToken}
```

**Query Parameters**

- `status`(optional): `ALL` | `SUBMITTED` | `IN_PROGRESS` (기본값: `ALL`)

**정책**

- 교수 권한 필요(`PROFESSOR`)
- 본인 강의의 시험/퀴즈만 조회 가능
- 해당 시험/퀴즈의 응시 기록(attempt) 목록을 반환
- 퀴즈도 응시 기록 조회는 가능(자동채점 결과 확인용)

**Response**

```json
{
  "success": true,
  "data": [
    {
      "attemptId": 7001,
      "examId": 601,
      "courseId": 101,
      "student": {
        "id": 2001,
        "studentNumber": "202012345",
        "name": "홍길동"
      },
      "startedAt": "2024-10-20T10:00:05Z",
      "submittedAt": "2024-10-20T10:16:00Z",
      "isLate": true,
      "latePenaltyRate": 0.10,
      "score": null,
      "feedback": null
    }
  ]
}
```

### 6.11 응시 결과 상세 조회(답안 포함) (교수)

```http
GET /api/v1/professor/exams/results/{attemptId}
Authorization: Bearer {accessToken}
```

**정책**

- 교수 권한 필요(`PROFESSOR`)
- 본인 강의의 응시 결과만 조회 가능
- `answerData`는 학생이 제출한 원본 답안(JSON) 제공
- `questionData`는 교수 조회이므로 **정답 포함 원본** 제공(채점/검수 목적)

**Response**

```json
{
  "success": true,
  "data": {
    "attemptId": 7001,
    "examId": 601,
    "courseId": 101,
    "student": {
      "id": 2001,
      "studentNumber": "202012345",
      "name": "홍길동"
    },
    "startedAt": "2024-10-20T10:00:05Z",
    "submittedAt": "2024-10-20T10:16:00Z",
    "isLate": true,
    "latePenaltyRate": 0.10,
    "score": null,
    "feedback": null,
    "answerData": {
      "answers": {
        "q1": 1,
        "q2": "Spring Boot는 ..."
      }
    },
    "questionData": {
      "questions": [
        {
          "id": "q1",
          "type": "MCQ",
          "prompt": "다음 중 옳은 것은?",
          "choices": ["A", "B", "C", "D"],
          "correctChoiceIndex": 1,
          "points": 10
        },
        {
          "id": "q2",
          "type": "SUBJECTIVE",
          "prompt": "Spring Boot에 대해 서술하시오.",
          "points": 10
        }
      ]
    }
  }
}
```

---

## 7. 성적 API

**공통 정의**

- **GradeStatus**
	- `PENDING`: 아직 산출/확정되지 않음(grade row가 없거나, 산출 전 상태)
	- `GRADED`: 산출/채점 완료(현재 구현에서는 주로 내부 상태로 사용 가능)
	- `PUBLISHED`: 성적 공개 완료(학생 조회는 이 상태만 노출)
- **공통 오류 응답 형식**

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

### 7.0 학기 목록 조회 (학생, 성적 조회용)

```http
GET /api/v1/student/academic-terms
Authorization: Bearer {accessToken}
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "year": 2024,
      "termType": "2",
      "startDate": "2024-09-01",
      "endDate": "2024-12-20"
    }
  ],
  "count": 1
}
```

**Error**

- 401 (Unauthorized): 토큰이 없거나 만료

---

### 7.0-A 현재 학기 조회 (학생)

```http
GET /api/v1/student/academic-terms/current
Authorization: Bearer {accessToken}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "year": 2025,
    "termType": "2",
    "startDate": "2025-09-01",
    "endDate": "2025-12-31"
  }
}
```

**Error**

- 401 (Unauthorized): 토큰이 없거나 만료
- 400 (Bad Request): 현재 날짜에 해당하는 학기가 없음 (academic_terms.start_date~end_date)

---

### 7.0-A-1 현재 학기 조회 (공통: 학생/교수)

```http
GET /api/v1/academic-terms/current
Authorization: Bearer {accessToken}
```

**정책**

- 학생/교수 모두 사용 가능 (인증 필요)
- academic_terms의 start_date~end_date 범위로 현재 날짜에 해당하는 학기를 반환

**Response**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "year": 2025,
    "termType": "2",
    "startDate": "2025-09-01",
    "endDate": "2025-12-31"
  }
}
```

**Error**

- 401 (Unauthorized): 토큰이 없거나 만료
- 400 (Bad Request): 현재 날짜에 해당하는 학기가 없음 (academic_terms.start_date~end_date)

---

### 7.0-1 학기 목록 조회 (교수, 지난 학기 강의/성적 조회용)

```http
GET /api/v1/professor/academic-terms
Authorization: Bearer {accessToken}
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "year": 2024,
      "termType": "2",
      "startDate": "2024-09-01",
      "endDate": "2024-12-20"
    }
  ],
  "count": 1
}
```

**Error**

- 401 (Unauthorized): 토큰이 없거나 만료

---

### 7.1 성적 조회 (학생, 공개된 성적만)

```http
GET /api/v1/student/grades?academicTermId={academicTermId}
Authorization: Bearer {accessToken}
```

**Query Parameters**

- `academicTermId` (optional): 학기 ID로 필터링 (미지정 시 전체 학기 조회)

**Response**

```json
{
  "success": true,
  "data": [
    {
      "academicTermId": 3,
      "courseId": 101,
        "courseName": "자료구조",
      "courseCredits": 3,
      "status": "PUBLISHED",
      "midtermScore": 88.00,
      "finalExamScore": 92.00,
      "quizScore": 40.00,
      "assignmentScore": 0.00,
      "attendanceScore": 100.00,
      "finalScore": 91.50,
      "finalGrade": "A0",
      "publishedAt": "2024-12-20T03:10:00"
    }
  ],
  "count": 1
}
```

**정책**

- `PUBLISHED`(공개 완료) 상태의 성적만 조회됩니다.
- 성적이 아직 공개되지 않은 경우 `data`는 빈 배열이 될 수 있습니다.
- 학기별 조회가 필요하면 먼저 `GET /api/v1/student/academic-terms`로 `academicTermId`를 확인한 뒤 사용하세요.

**Error**

- 401 (Unauthorized): 토큰이 없거나 만료

---

### 7.2 성적 공개 수동 실행 - 종료된 성적산출기간 대상 (교수)

```http
POST /api/v1/professor/grades/publish-ended-terms
Authorization: Bearer {accessToken}
```

**정책**

- `PROFESSOR` 권한이면 “아무 교수나” 실행 가능
- **성적 공개 기간(GRADE_PUBLISH) 중인 학기**를 대상으로 공개 처리를 실행
- “공개”는 이미 산출(7.5)되어 `status=GRADED`인 강의만 `PUBLISHED`로 전환됩니다.

**Response**

```json
{
  "success": true,
  "data": null,
  "message": "성적 공개 기간 대상 성적 공개 처리를 실행했습니다."
}
```

**Error**

- 401 (Unauthorized): 토큰이 없거나 만료
- 400 (Bad Request): 성적 공개 기간이 아님 / period_types에 `GRADE_PUBLISH` 누락 등

---

### 7.3 성적 공개 수동 실행 - 특정 학기 (교수)

```http
POST /api/v1/professor/grades/publish/terms/{academicTermId}
Authorization: Bearer {accessToken}
```

**정책**

- `PROFESSOR` 권한이면 “아무 교수나” 실행 가능
- 해당 학기의 **성적 공개 기간(GRADE_PUBLISH) 중에만** 실행 가능

**Response**

```json
{
  "success": true,
  "data": null,
  "message": "성적 공개 처리를 실행했습니다."
}
```

**Error**

- 401 (Unauthorized): 토큰이 없거나 만료
- 400 (Bad Request): 성적 공개 기간이 아님 / `GRADE_PUBLISH` 누락 등

---

### 7.4 담당 강의 수강생 성적 전체 조회 (교수)

```http
GET /api/v1/professor/courses/{courseId}/grades?status=ALL|PUBLISHED
Authorization: Bearer {accessToken}
```

**Query Parameters**

- `status` (optional): `ALL`(기본) | `PUBLISHED`

**정책**

- `PROFESSOR` 권한 + **해당 강의 담당 교수만** 조회 가능
- `ALL`은 grades가 아직 생성/공개되지 않은 학생도 포함되며, 이 경우 점수는 `null`, `status`는 `PENDING`으로 내려갈 수 있습니다.

**Response**

```json
{
  "success": true,
  "data": [
    {
      "courseId": 101,
      "academicTermId": 3,
      "courseName": "자료구조",
      "student": {
        "id": 2001,
        "studentNumber": 2001,
        "name": "홍길동"
      },
      "midtermScore": 88.00,
      "finalExamScore": 92.00,
      "quizScore": 40.00,
      "assignmentScore": 0.00,
      "attendanceScore": 100.00,
      "finalScore": 91.50,
      "finalGrade": "A0",
      "status": "PUBLISHED",
      "gradedAt": "2024-12-20T03:10:00",
      "publishedAt": "2024-12-20T03:10:00"
    }
  ],
  "count": 1
}
```

**PUBLISHED만 조회 예시**

```http
GET /api/v1/professor/courses/{courseId}/grades?status=PUBLISHED
Authorization: Bearer {accessToken}
```

**Error**

- 401 (Unauthorized): 토큰이 없거나 만료
- 400 (Bad Request): 담당 교수가 아님 / `status` 값이 잘못됨(ALL|PUBLISHED만 허용) / courseId가 유효하지 않음

---

### 7.5 특정 강의 성적 산출(점수 계산) 수동 실행 (교수)

```http
POST /api/v1/professor/courses/{courseId}/grades/calculate
Authorization: Bearer {accessToken}
```

**정책**

- `PROFESSOR` 권한 + **해당 강의 담당 교수만** 실행 가능
- 해당 강의가 속한 학기의 성적산출기간(GRADE_CALCULATION) **진행 중에만** 실행 가능
- 산출이 “실제로” 수행되지 않을 수 있는 대표 실패 사유(400):
	- 중간/기말에 **채점 미완료 제출(시험 score=null)** 존재
	- 과제 기능이 미구현인데 **assignment 비중 > 0**
	- 강의 평가비율 정책 미존재 등 입력/데이터 문제
- 산출 결과는 `GET /api/v1/professor/courses/{courseId}/grades?status=ALL`에서 `status=GRADED`로 확인할 수 있습니다.

**Request Body**

- 없음

**Response**

```json
{
  "success": true,
  "data": null,
  "message": "성적 산출 처리를 실행했습니다. (강의 단위)"
}
```

**Error**

- 401 (Unauthorized): 토큰이 없거나 만료
- 400 (Bad Request): 담당 교수가 아님 / 성적 산출기간이 아님 / `GRADE_CALCULATION` 누락 등

---

### 7.6 특정 강의 성적 공개(등급 확정) 수동 실행 (교수)

```http
POST /api/v1/professor/courses/{courseId}/grades/publish
Authorization: Bearer {accessToken}
```

**정책**

- `PROFESSOR` 권한 + **해당 강의 담당 교수만** 실행 가능
- 해당 강의가 속한 학기의 **성적 공개 기간(GRADE_PUBLISH) 중에만** 실행 가능
- **사전 산출(7.5)** 이 완료되어 `status=GRADED`인 경우에만 공개 가능
- 공개 시 상대평가 등급을 부여하고 `status=PUBLISHED`로 변경됩니다.

**Request Body**

- 없음

**Response**

```json
{
  "success": true,
  "data": null,
  "message": "성적 공개 처리를 실행했습니다. (강의 단위)"
}
```

**Error**

- 401 (Unauthorized): 토큰이 없거나 만료
- 400 (Bad Request): 담당 교수가 아님 / 성적 산출기간이 종료되지 않았음 / 산출(GRADED)되지 않았음 / `GRADE_CALCULATION` 누락 등

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

### 9.1 활성화된 기간 조회

```http
GET /api/v1/enrollments/periods/current?type={typeCode}
Authorization: Bearer {accessToken}
```

**Query Parameters**

- `type` (optional): 기간 타입 코드
	- 생략 시: 현재 활성화된 기간 중 하나를 반환 (가장 먼저 시작한 기간)
	- `ENROLLMENT`: 수강신청 기간
	- `COURSE_REGISTRATION`: 강의등록 기간
	- `ADJUSTMENT`: 정정 기간
	- `CANCELLATION`: 수강철회 기간
	- `GRADE_CALCULATION`: 성적산출기간 (교수: 산출 버튼 허용)
	- `GRADE_PUBLISH`: 성적공개기간 (교수: 공개 버튼 허용, 학생: 공개된 성적 조회)

**Examples**

```http
# 현재 활성화된 기간 조회 (타입 무관, 가장 먼저 시작한 기간)
GET /api/v1/enrollments/periods/current

# 수강신청 기간 조회
GET /api/v1/enrollments/periods/current?type=ENROLLMENT

# 강의등록 기간 조회
GET /api/v1/enrollments/periods/current?type=COURSE_REGISTRATION

# 정정 기간 조회
GET /api/v1/enrollments/periods/current?type=ADJUSTMENT
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
      "periodType": {
        "id": 1,
        "typeCode": "ENROLLMENT",
        "typeName": "수강신청",
        "description": "학생이 수강신청을 할 수 있는 기간"
      },
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

**periodType 필드 설명:**

- `id`: 기간 타입 식별자
- `typeCode`: 타입 코드 (ENROLLMENT: 수강신청, COURSE_REGISTRATION: 강의등록, ADJUSTMENT: 정정, CANCELLATION: 수강철회)
- `typeName`: 타입명 (수강신청, 강의등록, 정정, 수강철회)
- `description`: 타입 설명

### 9.2 수강신청 기간 중 강의 목록 조회

### 강의 목록 조회 (검색 및 필터링)

```http
GET /api/v1/enrollments/courses
Authorization: Bearer {accessToken}
```

**Query Parameters**

- `page`: 페이지 번호 (기본값: 0)
- `size`: 페이지 크기 (기본값: 10)
- `keyword`: 검색어 (과목명, 과목코드, 교수명 통합 검색)
- `departmentId`: 학과 ID (전체: null)
- `courseType`: 이수구분 (전체: null, 값: MAJOR_REQ, MAJOR_ELEC, GEN_REQ, GEN_ELEC)
- `credits`: 학점 (전체: null, 값: 1, 2, 3, 4)
- `enrollmentPeriodId`: 학기 ID (필수)
- `sort`: 정렬 (기본값: courseCode,asc)

**Request Example**

```
GET /api/v1/enrollments/courses?page=0&size=10&keyword=데이터베이스&departmentId=1&courseType=MAJOR_REQ&credits=3&enrollmentPeriodId=10&sort=courseCode,asc
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
          "isFull": false
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
GET /api/v1/carts
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
          "courseType": "전공필수",
          "currentStudents": 25,
          "maxStudents": 30,
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
POST /api/v1/carts/bulk
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
DELETE /api/v1/carts/bulk
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
        "courseId": 104,
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
DELETE /api/v1/carts
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
POST /api/v1/enrollments/bulk
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
        "message": "수강 정원이 마감되었습니다"
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
DELETE /api/v1/enrollments/bulk
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
GET /api/v1/enrollments/my
Authorization: Bearer {accessToken}
```

**Query Parameters**

- `enrollmentPeriodId`: 학기 ID (선택, 미입력시 현재 학기)

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
          "currentStudents": 25,
          "maxStudents": 30,
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

### 9.9 강의 상세 조회

```http
GET /api/v1/courses/{enrollmentId}
Authorization: Bearer {accessToken}
```

**Response**

```json
{
  "success": true,
  "data": {
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
      },
      "description": "알고리즘의 기본 개념과 설계 기법을 학습합니다"
    },
    "professor": {
      "id": 11,
      "name": "이교수",
      "email": "lee@mzc.ac.kr",
      "office": {
        "building": "공학관",
        "room": "301호"
      }
    },
    "schedule": [
      {
        "dayOfWeek": 2,
        "dayName": "화",
        "startTime": "10:11",
        "endTime": "11:30",
        "classroom": "공학관 302호"
      }
    ],
    "enrolledAt": "2024-08-16T10:00:00Z",
    "status": "ENROLLED",
    "canCancel": true,
    "cancellationDeadline": "2024-09-06T18:00:00Z"
  }
}
```

## 10. 과목(Subject) API

### 10.1 과목 목록 조회

```http
GET /api/v1/subjects
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR, STUDENT

**기본 동작**:

- **PROFESSOR**: 소속 학과 과목만 조회 (실수 방지)
- **STUDENT**: 전체 과목 조회 가능

**Query Parameters**

- `page`: 페이지 번호 (기본값: 0)
- `size`: 페이지 크기 (기본값: 20)
- `keyword`: 과목명 또는 과목코드 검색
- `departmentId`: 학과 필터 (교수는 자기 학과가 기본, 학생은 전체가 기본)
- `showAllDepartments`: 전체 학과 보기 (교수만 해당, 기본값: false)
- `courseType`: 이수구분 필터 (MAJOR_REQ, MAJOR_ELEC, GEN_REQ, GEN_ELEC)
- `credits`: 학점 필터 (1, 2, 3, 4)
- `isActive`: 활성 과목만 조회 (기본값: true)

**Response**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 15,
        "subjectCode": "CS301",
        "subjectName": "데이터베이스",
        "englishName": "Database Systems",
        "credits": 3,
        "courseType": {
          "code": "MAJOR_REQ",
          "name": "전공필수",
          "color": "#FFB4C8"
        },
        "department": {
          "id": 1,
          "name": "컴퓨터공학과",
          "college": "공과대학"
        },
        "description": "데이터베이스의 기본 개념과 SQL을 학습합니다.",
        "prerequisites": [
          {
            "id": 12,
            "subjectCode": "CS201",
            "subjectName": "자료구조"
          }
        ],
        "currentTermSections": 3,
        "isActive": true,
        "createdAt": "2024-03-01T10:00:00Z"
      }
    ],
    "totalElements": 156,
    "totalPages": 8,
    "size": 20,
    "number": 0,
    "first": true,
    "last": false,
    "numberOfElements": 20,
    "empty": false
  }
}
```

### 10.2 과목 상세 조회

```http
GET /api/v1/subjects/{subjectId}
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR, STUDENT

**Response**

```json
{
  "success": true,
  "data": {
    "id": 15,
    "subjectCode": "CS301",
    "subjectName": "데이터베이스",
    "englishName": "Database Systems",
    "credits": 3,
    "courseType": {
      "code": "MAJOR_REQ",
      "name": "전공필수",
      "color": "#FFB4C8"
    },
    "department": {
      "id": 1,
      "name": "컴퓨터공학과",
      "college": "공과대학"
    },
    "description": "데이터베이스의 기본 개념, 설계, SQL, 트랜잭션 관리 등을 학습합니다.",
    "objectives": [
      "데이터베이스 설계 능력 함양",
      "SQL 작성 및 최적화",
      "트랜잭션 이해"
    ],
    "prerequisites": [
      {
        "id": 12,
        "subjectCode": "CS201",
        "subjectName": "자료구조",
        "credits": 3
      }
    ],
    "courses": [
      {
        "id": 101,
        "section": "01",
        "professor": {
          "id": 10,
          "name": "김교수"
        },
        "term": {
          "year": 2024,
          "termType": "2"
        },
        "currentStudents": 35,
        "maxStudents": 40
      },
      {
        "id": 102,
        "section": "02",
        "professor": {
          "id": 11,
          "name": "이교수"
        },
        "term": {
          "year": 2024,
          "termType": "2"
        },
        "currentStudents": 30,
        "maxStudents": 40
      }
    ],
    "isActive": true,
    "createdAt": "2024-03-01T10:00:00Z"
  }
}
```

### 10.3 과목 검색

```http
GET /api/v1/subjects/search
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR

**용도**: 교수가 강의 등록 시 과목 검색 (페이징 지원)

**Query Parameters**

- `q`: 검색어 (과목명 또는 과목코드, 최소 2글자) - 필수
- `page`: 페이지 번호 (기본값: 0)
- `size`: 페이지 크기 (기본값: 20, 최대: 50)

**Response**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 15,
        "subjectCode": "CS301",
        "subjectName": "데이터베이스",
        "credits": 3,
        "courseType": "전공필수",
        "department": "컴퓨터공학과"
      },
      {
        "id": 18,
        "subjectCode": "CS305",
        "subjectName": "데이터베이스 설계",
        "credits": 3,
        "courseType": "전공선택",
        "department": "컴퓨터공학과"
      }
    ],
    "totalElements": 45,
    "totalPages": 3,
    "size": 20,
    "number": 0,
    "first": true,
    "last": false,
    "numberOfElements": 20,
    "empty": false
  }
}
```

**Response 필드 설명 (Spring Page 표준)**

- `content`: 과목 목록
- `totalElements`: 전체 요소 수
- `totalPages`: 전체 페이지 수
- `size`: 페이지 크기
- `number`: 현재 페이지 번호 (0부터 시작)
- `first`: 첫 페이지 여부
- `last`: 마지막 페이지 여부
- `numberOfElements`: 현재 페이지의 요소 수
- `empty`: 비어있는지 여부

---

## 11. 교수 강의 관리

### 11.1 교수 강의 목록 조회

```http
GET /api/v1/professor/courses
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR

**Query Parameters**

- `year`: 학년도 (예: 2024)
- `term`: 학기 (1, 2, SUMMER, WINTER)
- `status`: 강의 상태 (DRAFT, PUBLISHED, CLOSED)

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "courseCode": "CS301",
      "courseName": "데이터베이스",
      "section": "01",
      "department": {
        "id": 1,
        "name": "컴퓨터공학과"
      },
      "credits": 3,
      "courseType": {
        "code": "MAJOR_REQ",
        "name": "전공필수"
      },
      "maxStudents": 40,
      "currentStudents": 35,
      "description": "데이터베이스 기본 개념과 SQL을 학습합니다.",
      "schedule": [
        {
          "dayOfWeek": 1,
          "dayName": "월",
          "startTime": "09:00",
          "endTime": "10:30",
          "classroom": "공학관 401호"
        },
        {
          "dayOfWeek": 3,
          "dayName": "수",
          "startTime": "09:00",
          "endTime": "10:30",
          "classroom": "공학관 401호"
        }
      ],
      "status": "PUBLISHED",
      "createdAt": "2024-08-01T10:00:00Z"
    }
  ]
}
```

### 11.2 교수 강의 등록

```http
POST /api/v1/professor/courses
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR

**Request Body - 방법 A: 기존 과목 선택**

```json
{
  "enrollmentPeriodId": 10,
  "subjectId": 15,
  "section": "01",
  "maxStudents": 40,
  "description": "이번 학기는 MySQL 중심으로 실습을 진행합니다.",
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
  "syllabus": {
    "objectives": ["데이터베이스 설계", "SQL 작성", "트랜잭션 이해"],
    "textbook": "데이터베이스 시스템 (7판)",
    "grading": {
      "midterm": 30,
      "final": 30,
      "quiz": 10,
      "assignment": 20,
      "attendance": 10
    }
  },
  "totalWeeks": 16
}
```

**Request Body - 방법 B: 새 과목 생성하면서 강의 등록**

```json
{
  "enrollmentPeriodId": 10,
  "subject": {
    "subjectCode": "CS401",
    "subjectName": "인공지능",
    "englishName": "Artificial Intelligence",
    "credits": 3,
    "courseType": "MAJOR_ELEC",
    "departmentId": 1,
    "description": "인공지능의 기본 개념과 머신러닝 알고리즘을 학습합니다.",
    "prerequisiteSubjectIds": [15, 20]
  },
  "section": "01",
  "maxStudents": 40,
  "schedule": [
    {
      "dayOfWeek": 2,
      "startTime": "13:00",
      "endTime": "14:30",
      "classroom": "공학관 501호"
    }
  ],
  "syllabus": {
    "objectives": ["AI 기본 이해", "머신러닝 알고리즘 구현"],
    "textbook": "인공지능 개론 (3판)",
    "grading": {
      "midterm": 30,
      "final": 30,
      "quiz": 10,
      "assignment": 25,
      "attendance": 5
    }
  },
  "totalWeeks": 16
}
```

**Request Body 필드 설명**

- `enrollmentPeriodId`: 학기 ID (필수)
- `subjectId`: 기존 과목 ID (방법 A, subjectId 또는 subject 중 하나 필수)
- `subject`: 새 과목 정보 (방법 B)
	- `subjectCode`: 과목코드 (필수, 학과 내 고유)
	- `subjectName`: 과목명 (필수)
	- `englishName`: 영문 과목명 (선택)
	- `credits`: 학점 (필수, 1-4)
	- `courseType`: 이수구분 (필수, MAJOR_REQ/MAJOR_ELEC/GEN_REQ/GEN_ELEC)
	- `departmentId`: 학과 ID (필수)
	- `description`: 과목 설명 (선택)
	- `prerequisiteSubjectIds`: 선수과목 ID 배열 (선택)
- `section`: 분반 (필수, "01", "02" 등)
- `maxStudents`: 최대 수강인원 (필수)
- `description`: 강의 설명 (선택, 분반별로 다른 설명 가능)
- `schedule`: 시간표 배열 (필수)
- `syllabus`: 강의계획서 (필수)
- `totalWeeks`: 총 주차 수 (필수, 보통 16)

**Response**

```json
{
  "success": true,
  "data": {
    "course": {
      "id": 101,
      "courseCode": "CS301",
      "courseName": "데이터베이스",
      "section": "01",
      "credits": 3,
      "maxStudents": 40,
      "description": "이번 학기는 MySQL 중심으로 실습을 진행합니다.",
      "status": "DRAFT",
      "createdAt": "2024-08-15T10:00:00Z"
    },
    "subject": {
      "id": 15,
      "isNewlyCreated": false
    }
  },
  "message": "강의가 등록되었습니다"
}
```

**검증 순서**

1. 수강신청 기간 존재 여부 체크
2. `subjectId` 또는 `subject` 중 하나만 제공되었는지 체크
3. **방법 A (subjectId 사용)**:
	- Subject 존재 여부 체크
	- 같은 학기, 같은 subject, 같은 section 중복 체크
4. **방법 B (새 subject 생성)**:
	- SubjectCode 중복 체크 (같은 학과 내)
	- Prerequisite subjects 존재 여부 체크
	- Subject 생성 후 Course 생성
5. 교수 시간표 충돌 체크
6. 강의 생성

**Error Codes**
| 코드 | 설명 | HTTP Status |
|------|------|-------------|
| `PROFESSOR_001` | 교수 권한이 없음 | 403 |
| `SUBJECT_001` | 과목을 찾을 수 없음 | 404 |
| `SUBJECT_002` | 중복된 과목코드 (같은 학과 내) | 400 |
| `SUBJECT_003` | 선수과목을 찾을 수 없음 | 400 |
| `SUBJECT_004` | subjectId와 subject 둘 다 제공되거나 둘 다 누락 | 400 |
| `COURSE_003` | 본인의 강의가 아님 | 403 |
| `COURSE_004` | 수강신청 시작 후 수정 불가 | 400 |
| `COURSE_007` | 같은 학기/과목/분반 중복 | 400 |
| `TIME_CONFLICT` | 교수 시간표 충돌 | 400 |
| `ENROLLMENT_PERIOD_NOT_FOUND` | 수강신청 기간을 찾을 수 없음 | 404 |

### 11.3 교수 강의 수정

```http
PUT /api/v1/professor/courses/{courseId}
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR (본인 강의만)

**Request Body**

```json
{
  "courseName": "데이터베이스 시스템",
  "maxStudents": 45,
  "description": "수정된 강의 설명",
  "schedule": [
    {
      "dayOfWeek": 1,
      "startTime": "10:00",
      "endTime": "11:30",
      "classroom": "공학관 402호"
    }
  ]
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": 101,
    "courseCode": "CS301",
    "courseName": "데이터베이스 시스템",
    "maxStudents": 45,
    "updatedAt": "2024-08-16T14:30:00Z"
  },
  "message": "강의가 수정되었습니다"
}
```

### 11.4 교수 강의 삭제

```http
DELETE /api/v1/professor/courses/{courseId}
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR (본인 강의만, 수강신청 시작 전에만 가능)

**Response**

```json
{
  "success": true,
  "data": {
    "courseId": 101,
    "courseCode": "CS301",
    "courseName": "데이터베이스",
    "deletedAt": "2024-08-16T15:00:00Z"
  },
  "message": "강의가 삭제되었습니다"
}
```

**Error Codes**
| 코드 | 설명 | HTTP Status |
|------|------|-------------|
| `COURSE_004` | 수강신청 시작 후 삭제 불가 | 400 |
| `COURSE_006` | 수강생이 있어 삭제 불가 | 400 |

### 11.5 교수 강의 상세 조회

```http
GET /api/v1/professor/courses/{courseId}
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR (본인 강의만)

**Response**

```json
{
  "success": true,
  "data": {
    "id": 101,
    "courseCode": "CS301",
    "courseName": "데이터베이스",
    "section": "01",
    "department": {
      "id": 1,
      "name": "컴퓨터공학과"
    },
    "credits": 3,
    "courseType": {
      "code": "MAJOR_REQ",
      "name": "전공필수"
    },
    "maxStudents": 40,
    "currentStudents": 35,
    "description": "데이터베이스 기본 개념과 SQL을 학습합니다.",
    "schedule": [
      {
        "dayOfWeek": 1,
        "dayName": "월",
        "startTime": "09:00",
        "endTime": "10:30",
        "classroom": "공학관 401호"
      }
    ],
    "syllabus": {
      "objectives": ["데이터베이스 설계", "SQL 작성"],
      "textbook": "데이터베이스 시스템 (7판)",
      "grading": {
        "midterm": 30,
        "final": 30,
        "quiz": 10,
        "assignment": 20,
        "attendance": 10
      }
    },
    "statistics": {
      "attendanceRate": 95.5,
      "assignmentSubmissionRate": 88.2,
      "averageScore": 82.5
    },
    "students": [
      {
        "studentId": 1,
        "name": "김학생",
        "studentNumber": "202012345",
        "email": "202012345@mzc.ac.kr"
      }
    ],
    "status": "PUBLISHED",
    "createdAt": "2024-08-01T10:00:00Z"
  }
}
```

---

## 12. 강의 주차 관리

### 12.1 강의 주차 목록 조회 (교수/수강중 학생)

```http
GET /api/v1/courses/{courseId}/weeks
Authorization: Bearer {accessToken}
```

**권한**

- PROFESSOR: 본인 강의
- STUDENT: 해당 강의를 수강신청(수강중)한 학생

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
          "order": 1,
          "createdAt": "2024-09-01T10:00:00Z"
        },
        {
          "id": 2002,
          "contentType": "DOCUMENT",
          "title": "강의노트 - 1주차",
          "contentUrl": "https://files.mzc.ac.kr/courses/101/week1/notes.pdf",
          "order": 2,
          "createdAt": "2024-09-01T10:05:00Z"
        }
      ],
      "createdAt": "2024-09-01T09:00:00Z"
    },
    {
      "id": 1002,
      "weekNumber": 2,
      "weekTitle": "2주차: ER 다이어그램",
      "contents": [],
      "createdAt": "2024-09-05T14:00:00Z"
    }
  ]
}
```

### 12.2 강의 주차 등록

```http
POST /api/v1/professor/courses/{courseId}/weeks
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR (본인 강의만)

**Request Body**

```json
{
  "weekNumber": 2,
  "weekTitle": "2주차: ER 다이어그램",
  "contents": [
    {
      "contentType": "VIDEO",
      "title": "ER 다이어그램 작성법",
      "contentUrl": "https://video.mzc.ac.kr/courses/101/week2/lecture1.mp4",
      "duration": "42:30",
      "order": 1
    },
    {
      "contentType": "DOCUMENT",
      "title": "강의노트 - 2주차",
      "contentUrl": "https://files.mzc.ac.kr/courses/101/week2/notes.pdf",
      "order": 2
    }
  ]
}
```

**Request Body 필드 설명**

- `weekNumber`: 주차 번호 (필수)
- `weekTitle`: 주차 제목 (필수)
- `contents`: 콘텐츠 배열 (선택)
	- `contentType`: 콘텐츠 유형 (VIDEO, DOCUMENT, LINK, QUIZ) - 필수
	- `title`: 콘텐츠 제목 - 필수
	- `contentUrl`: 콘텐츠 URL - 필수
	- `duration`: 재생 시간 (VIDEO인 경우, 형식: "HH:MM:SS" 또는 "MM:SS") - 선택
	- `order`: 콘텐츠 순서 (선택, 기본값: 마지막 순서)

**Response**

```json
{
  "success": true,
  "data": {
    "id": 1002,
    "weekNumber": 2,
    "weekTitle": "2주차: ER 다이어그램",
    "contents": [
      {
        "id": 2003,
        "contentType": "VIDEO",
        "title": "ER 다이어그램 작성법",
        "contentUrl": "https://video.mzc.ac.kr/courses/101/week2/lecture1.mp4",
        "duration": "42:30",
        "order": 1,
        "createdAt": "2024-09-05T14:00:00Z"
      },
      {
        "id": 2004,
        "contentType": "DOCUMENT",
        "title": "강의노트 - 2주차",
        "contentUrl": "https://files.mzc.ac.kr/courses/101/week2/notes.pdf",
        "order": 2,
        "createdAt": "2024-09-05T14:01:00Z"
      }
    ],
    "createdAt": "2024-09-05T14:00:00Z"
  },
  "message": "주차가 생성되었습니다"
}
```

**Error Codes**
| 코드 | 설명 | HTTP Status |
|------|------|-------------|
| `WEEK_001` | 중복된 주차 번호 | 400 |
| `WEEK_002` | 주차 번호가 유효하지 않음 | 400 |
| `COURSE_003` | 본인의 강의가 아님 | 403 |
| `CONTENT_001` | 지원하지 않는 콘텐츠 타입 | 400 |
| `CONTENT_004` | 필수 필드 누락 (contentType, title, contentUrl) | 400 |
| `CONTENT_005` | 콘텐츠 순서 중복 | 400 |

### 12.3 강의 주차 수정

```http
PUT /api/v1/professor/courses/{courseId}/weeks/{weekId}
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR (본인 강의만)

**Request Body**

```json
{
  "weekTitle": "2주차: ER 모델링과 다이어그램"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": 1002,
    "weekNumber": 2,
    "weekTitle": "2주차: ER 모델링과 다이어그램",
    "updatedAt": "2024-09-06T10:00:00Z"
  },
  "message": "주차가 수정되었습니다"
}
```

### 12.4 강의 주차 삭제

```http
DELETE /api/v1/professor/courses/{courseId}/weeks/{weekId}
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR (본인 강의만)

**Response**

```json
{
  "success": true,
  "data": {
    "weekId": 1002,
    "weekNumber": 2,
    "weekTitle": "2주차: ER 다이어그램",
    "deletedAt": "2024-09-06T15:00:00Z"
  },
  "message": "주차가 삭제되었습니다"
}
```

**Error Codes**
| 코드 | 설명 | HTTP Status |
|------|------|-------------|
| `WEEK_003` | 콘텐츠가 있어 삭제 불가 | 400 |
| `WEEK_004` | 이미 공개된 주차는 삭제 불가 | 400 |

### 12.5 주차별 콘텐츠 추가

```http
POST /api/v1/professor/courses/{courseId}/weeks/{weekId}/contents
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**권한**: PROFESSOR (본인 강의만)

**Request Body**

```json
{
  "contentType": "LINK",
  "title": "ER 다이어그램 작성법",
  "contentUrl": "https://video.mzc.ac.kr/courses/101/week2/lecture1.mp4"
}
```

**필드 설명**

- `contentType`: 콘텐츠 유형 (DOCUMENT, LINK) - 필수
- `title`: 콘텐츠 제목 - 필수
- `contentUrl`: 콘텐츠 URL - 필수

**정렬 규칙**

- 주차/콘텐츠 조회 응답에서 `contents`는 **LINK 타입이 항상 먼저** 오도록 정렬됩니다.
- 동일 타입 내 정렬은 서버 내부 순서(displayOrder) 기준입니다. (클라이언트가 순서를 변경하는 API는 제공하지 않습니다.)

**Response**

```json
{
  "success": true,
  "data": {
    "id": 2003,
    "contentType": "VIDEO",
    "title": "ER 다이어그램 작성법",
    "contentUrl": "https://video.mzc.ac.kr/courses/101/week2/lecture1.mp4",
    "duration": "42:30",
    "order": 1,
    "createdAt": "2024-09-06T10:00:00Z"
  },
  "message": "콘텐츠가 추가되었습니다"
}
```

**Error Codes**
| 코드 | 설명 | HTTP Status |
|------|------|-------------|
| `CONTENT_001` | 지원하지 않는 콘텐츠 타입 | 400 |
| `CONTENT_004` | 필수 필드 누락 | 400 |

### 12.6 콘텐츠 수정

```http
PUT /api/v1/professor/contents/{contentId}
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR (본인 강의만)

**Request Body**

```json
{
  "title": "ER 다이어그램 작성법 (수정)",
  "contentUrl": "https://video.mzc.ac.kr/courses/101/week2/lecture1.mp4",
  "duration": "42:30"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": 2003,
    "contentType": "VIDEO",
    "title": "ER 다이어그램 작성법 (수정)",
    "contentUrl": "https://video.mzc.ac.kr/courses/101/week2/lecture1.mp4",
    "duration": "42:30",
    "order": 1,
    "createdAt": "2024-09-06T10:00:00Z"
  },
  "message": "콘텐츠가 수정되었습니다"
}
```

### 12.7 콘텐츠 삭제

```http
DELETE /api/v1/professor/contents/{contentId}
Authorization: Bearer {accessToken}
```

**권한**: PROFESSOR (본인 강의만)

**Response**

```json
{
  "success": true,
  "data": null,
  "message": "콘텐츠가 삭제되었습니다"
}
```

---

## 13. 공지사항 API

### 13.1 공지사항 목록

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

### 13.2 공지사항 상세 조회

```http
GET /notices/{noticeId}
Authorization: Bearer {accessToken}
```

---

## 14. 시간표 API

### 14.1 내 시간표 조회

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

## 15. 학사 일정 API

### 15.1 학사 일정 조회

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

## 16. 대시보드 통계 API

### 16.1 대시보드 요약 정보

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

| 코드               | 설명                                  |
|------------------|-------------------------------------|
| `AUTH_001`       | 인증 토큰이 없거나 유효하지 않음                  |
| `AUTH_002`       | 토큰이 만료됨                             |
| `AUTH_003`       | 권한이 없음                              |
| `USER_001`       | 사용자를 찾을 수 없음                        |
| `USER_002`       | 잘못된 비밀번호                            |
| `SUBJECT_001`    | 과목(Subject)을 찾을 수 없음                |
| `SUBJECT_002`    | 중복된 과목코드 (같은 학과 내)                  |
| `SUBJECT_003`    | 선수과목을 찾을 수 없음                       |
| `SUBJECT_004`    | subjectId와 subject 둘 다 제공되거나 둘 다 누락 |
| `COURSE_001`     | 강의(Course)를 찾을 수 없음                 |
| `COURSE_002`     | 수강신청되지 않은 과목                        |
| `COURSE_003`     | 본인의 강의가 아님                          |
| `COURSE_004`     | 수강신청 시작 후 수정/삭제 불가                  |
| `COURSE_005`     | 중복된 과목코드/분반                         |
| `COURSE_006`     | 수강생이 있어 삭제 불가                       |
| `COURSE_007`     | 같은 학기/과목/분반 중복                      |
| `PROFESSOR_001`  | 교수 권한이 없음                           |
| `WEEK_001`       | 중복된 주차 번호                           |
| `WEEK_002`       | 주차 번호가 유효하지 않음                      |
| `WEEK_003`       | 콘텐츠가 있어 삭제 불가                       |
| `WEEK_004`       | 이미 공개된 주차는 삭제 불가                    |
| `CONTENT_001`    | 지원하지 않는 콘텐츠 타입                      |
| `CONTENT_002`    | 파일 크기 초과                            |
| `CONTENT_003`    | 허용되지 않는 파일 형식                       |
| `CONTENT_004`    | 필수 필드 누락                            |
| `ASSIGNMENT_001` | 과제를 찾을 수 없음                         |
| `ASSIGNMENT_002` | 제출 기한이 지남                           |
| `ASSIGNMENT_003` | 이미 제출됨                              |
| `FILE_001`       | 파일 크기 초과                            |
| `FILE_002`       | 허용되지 않는 파일 형식                       |

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
