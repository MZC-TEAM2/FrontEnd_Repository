/**
 * Assessment(시험/퀴즈) 관련 API 함수
 *
 * API_SPECIFICATION.md 기준:
 * - 학생:
 *   - GET  /api/v1/exams?courseId={courseId}&examType={examType}
 *   - GET  /api/v1/exams/{examId}
 *   - GET  /api/v1/exams/{examId}/my-result
 *   - POST /api/v1/exams/{examId}/start
 *   - POST /api/v1/exams/results/{attemptId}/submit
 * - 교수:
 *   - GET  /api/v1/professor/exams?courseId={courseId}&examType={examType}
 *   - GET  /api/v1/professor/exams/{examId}
 *   - GET  /api/v1/professor/exams/{examId}/attempts
 *   - GET  /api/v1/professor/exams/results/{attemptId}
 *   - POST /api/v1/boards/{boardType}/exams   (boardType: QUIZ|EXAM)
 *   - PUT  /api/v1/exams/{examId}/edit
 *   - DELETE /api/v1/exams/{examId}/delete
 *   - PUT  /api/v1/exams/results/{attemptId}/grade
 */
import axiosInstance from './axiosInstance';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function getWithFallback(urls) {
  let lastError = null;
  for (const url of urls) {
    try {
      const res = await axiosInstance.get(url);
      return res;
    } catch (e) {
      lastError = e;
      // axiosInstance가 reject하는 객체 형태: { status, message, data }
      if (e?.status === 404) {
        // try next
        continue;
      }
      throw e;
    }
  }
  throw lastError || new Error('Request failed');
}

async function postWithFallback(urls, body) {
  let lastError = null;
  for (const url of urls) {
    try {
      const res = await axiosInstance.post(url, body);
      return res;
    } catch (e) {
      lastError = e;
      if (e?.status === 404) continue;
      throw e;
    }
  }
  throw lastError || new Error('Request failed');
}

async function putWithFallback(urls, body) {
  let lastError = null;
  for (const url of urls) {
    try {
      const res = await axiosInstance.put(url, body);
      return res;
    } catch (e) {
      lastError = e;
      if (e?.status === 404) continue;
      throw e;
    }
  }
  throw lastError || new Error('Request failed');
}

async function deleteWithFallback(urls) {
  let lastError = null;
  for (const url of urls) {
    try {
      const res = await axiosInstance.delete(url);
      return res;
    } catch (e) {
      lastError = e;
      if (e?.status === 404) continue;
      throw e;
    }
  }
  throw lastError || new Error('Request failed');
}

/**
 * 시험/퀴즈 목록 조회 (학생)
 * @param {Object} params
 * @param {number|string} params.courseId
 * @param {'MIDTERM'|'FINAL'|'REGULAR'|'QUIZ'} [params.examType]
 */
export async function getStudentExams({ courseId, examType } = {}) {
  const query = new URLSearchParams();
  if (courseId != null && courseId !== '') query.append('courseId', String(courseId));
  if (examType) query.append('examType', String(examType));

  const response = await getWithFallback([
    `${BASE_URL}/api/v1/exams?${query.toString()}`,
    `${BASE_URL}/api/exams?${query.toString()}`, // legacy fallback
  ]);
  return response.data;
}

/**
 * 시험/퀴즈 상세 조회 (학생)
 * @param {number|string} examId
 */
export async function getStudentExamDetail(examId) {
  if (examId == null || examId === '') throw new Error('examId is required');
  const response = await getWithFallback([
    `${BASE_URL}/api/v1/exams/${examId}`,
    `${BASE_URL}/api/exams/${examId}`, // legacy fallback
  ]);
  return response.data;
}

/**
 * 내 응시 결과 조회 (학생)
 * @param {number|string} examId
 */
export async function getMyExamResult(examId) {
  if (examId == null || examId === '') throw new Error('examId is required');
  const response = await getWithFallback([
    `${BASE_URL}/api/v1/exams/${examId}/my-result`,
  ]);
  return response.data;
}

/**
 * 응시 시작 (학생) - attempt 생성
 * @param {number|string} examId
 */
export async function startExamAttempt(examId) {
  if (examId == null || examId === '') throw new Error('examId is required');
  const response = await postWithFallback(
    [`${BASE_URL}/api/v1/exams/${examId}/start`, `${BASE_URL}/api/exams/${examId}/start`],
    null
  );
  return response.data;
}

/**
 * 최종 제출 (학생)
 * @param {number|string} attemptId
 * @param {Object<string, any>} answers - { [questionId]: answer }
 */
export async function submitExamAttempt(attemptId, answers) {
  if (attemptId == null || attemptId === '') throw new Error('attemptId is required');
  const response = await postWithFallback(
    [
      `${BASE_URL}/api/v1/exams/results/${attemptId}/submit`,
      `${BASE_URL}/api/exams/results/${attemptId}/submit`, // legacy fallback
    ],
    { answers: answers || {} }
  );
  return response.data;
}

/**
 * 시험/퀴즈 목록 조회 (교수)
 * @param {Object} params
 * @param {number|string} params.courseId
 * @param {'MIDTERM'|'FINAL'|'REGULAR'|'QUIZ'} [params.examType]
 */
export async function getProfessorExams({ courseId, examType } = {}) {
  const query = new URLSearchParams();
  if (courseId != null && courseId !== '') query.append('courseId', String(courseId));
  if (examType) query.append('examType', String(examType));

  const response = await getWithFallback([
    `${BASE_URL}/api/v1/professor/exams?${query.toString()}`,
    `${BASE_URL}/api/professor/exams?${query.toString()}`, // legacy fallback (user mentioned)
  ]);
  return response.data;
}

/**
 * 시험/퀴즈 상세 조회 (교수)
 * @param {number|string} examId
 */
export async function getProfessorExamDetail(examId) {
  if (examId == null || examId === '') throw new Error('examId is required');
  const response = await getWithFallback([
    `${BASE_URL}/api/v1/professor/exams/${examId}`,
    `${BASE_URL}/api/professor/exams/${examId}`, // legacy fallback
  ]);
  return response.data;
}

/**
 * 응시자/응시 결과 목록 조회 (교수)
 * @param {number|string} examId
 * @param {Object} [params]
 * @param {'ALL'|'SUBMITTED'|'IN_PROGRESS'} [params.status]
 */
export async function getProfessorExamAttempts(examId, { status } = {}) {
  if (examId == null || examId === '') throw new Error('examId is required');
  const query = new URLSearchParams();
  if (status) query.append('status', String(status));
  const qs = query.toString();
  const response = await getWithFallback([
    `${BASE_URL}/api/v1/professor/exams/${examId}/attempts${qs ? `?${qs}` : ''}`,
  ]);
  return response.data;
}

/**
 * 응시 결과 상세 조회(답안 포함) (교수)
 * @param {number|string} attemptId
 */
export async function getProfessorExamAttemptResult(attemptId) {
  if (attemptId == null || attemptId === '') throw new Error('attemptId is required');
  const response = await getWithFallback([`${BASE_URL}/api/v1/professor/exams/results/${attemptId}`]);
  return response.data;
}

/**
 * 시험 채점 (교수) - 총점/피드백 저장
 * @param {number|string} attemptId
 * @param {{score: number, feedback?: string|null}} payload
 */
export async function gradeExamAttempt(attemptId, payload) {
  if (attemptId == null || attemptId === '') throw new Error('attemptId is required');
  const response = await putWithFallback(
    [
      `${BASE_URL}/api/v1/exams/results/${attemptId}/grade`,
      `${BASE_URL}/api/exams/results/${attemptId}/grade`, // legacy fallback
    ],
    payload
  );
  return response.data;
}

/**
 * 시험/퀴즈 등록 (교수)
 * @param {'QUIZ'|'EXAM'} boardType
 * @param {Object} payload
 */
export async function createExam(boardType, payload) {
  if (!boardType) throw new Error('boardType is required (QUIZ|EXAM)');
  const response = await postWithFallback(
    [
      `${BASE_URL}/api/v1/boards/${boardType}/exams`,
      `${BASE_URL}/api/v1/boards/${String(boardType).toLowerCase()}/exams`, // 혹시 소문자 라우팅인 경우
    ],
    payload
  );
  return response.data;
}

/**
 * 시험/퀴즈 수정 (교수)
 * @param {number|string} examId
 * @param {Object} payload
 */
export async function updateExam(examId, payload) {
  if (examId == null || examId === '') throw new Error('examId is required');
  const response = await putWithFallback(
    [`${BASE_URL}/api/v1/exams/${examId}/edit`, `${BASE_URL}/api/exams/${examId}/edit`],
    payload
  );
  return response.data;
}

/**
 * 시험/퀴즈 삭제 (교수)
 * @param {number|string} examId
 */
export async function deleteExam(examId) {
  if (examId == null || examId === '') throw new Error('examId is required');
  const response = await deleteWithFallback([
    `${BASE_URL}/api/v1/exams/${examId}/delete`,
    `${BASE_URL}/api/exams/${examId}/delete`,
  ]);
  return response.data;
}


