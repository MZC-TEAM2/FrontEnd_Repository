import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMyEnrollments } from '../../../api/courseApi';
import { transformEnrollmentData } from '../transformers/courseTransformers';

// 매우 단순한 in-memory 캐시(탭 전환/페이지 이동 시 깜빡임 최소화)
const CACHE_TTL_MS = 30_000;
let cached = null; // { at, term, summary, courses }

export const invalidateMyCoursesCache = () => {
  cached = null;
};

/**
 * 학생: 수강중 과목 / 시간표 페이지에서 공통으로 쓰는 데이터 로더
 * - source of truth: 9.8 GET /api/v1/enrollments/my
 *   (수강신청 기간과 무관하게 "내 수강신청(수강중)" 내역을 반환)
 */
export default function useMyCourses(options = {}) {
  const { forceOnMount = false, enrollmentPeriodId = null } = options;
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);
  const [term, setTerm] = useState(cached?.term ?? null);
  const [summary, setSummary] = useState(cached?.summary ?? null);
  const [courses, setCourses] = useState(cached?.courses ?? []);

  const inFlightRef = useRef(false);

  const load = useCallback(async ({ force = false } = {}) => {
    if (inFlightRef.current) return;

    const now = Date.now();
    if (!force && cached && now - cached.at < CACHE_TTL_MS) {
      setLoading(false);
      setError(null);
      setTerm(cached.term);
      setSummary(cached.summary);
      setCourses(cached.courses);
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await getMyEnrollments(enrollmentPeriodId);
      if (!res?.success) {
        throw new Error(res?.message || '수강 과목 정보를 불러올 수 없습니다.');
      }

      const data = res.data || {};
      const nextTerm = data.term ?? null; // 9.8: term.id(=enrollmentPeriodId), year, termType, termName
      const nextSummary = data.summary ?? null;
      const nextCourses = (data.enrollments ?? []).map(transformEnrollmentData);

      cached = { at: Date.now(), term: nextTerm, summary: nextSummary, courses: nextCourses };

      setTerm(nextTerm);
      setSummary(nextSummary);
      setCourses(nextCourses);
    } catch (e) {
      setError(e?.message || '수강 과목 정보를 불러오는 중 오류가 발생했습니다.');
      setCourses([]);
      setTerm(null);
      setSummary(null);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    load({ force: forceOnMount });
  }, [load, forceOnMount]);

  const totalCredits = useMemo(() => summary?.totalCredits ?? courses.reduce((sum, c) => sum + (c.credits || 0), 0), [summary, courses]);

  return {
    loading,
    error,
    term,
    summary,
    courses,
    totalCredits,
    reload: () => load({ force: true }),
  };
}


