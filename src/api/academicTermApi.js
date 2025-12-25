/**
 * 학기(academic term) 관련 유틸 API
 *
 * 목적:
 * - 현재 활성 기간(`/enrollments/periods/current`) 응답에 term.id가 없을 수 있어도
 *   `year + termType`로 academic-terms 목록에서 `id(=academicTermId)`를 안전하게 찾는다.
 */

import axiosInstance from './axiosInstance';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const termOrder = {'2': 4, '1': 3, WINTER: 2, SUMMER: 1};

const sortTermsDesc = (a, b) => {
    if ((a?.year || 0) !== (b?.year || 0)) return (b?.year || 0) - (a?.year || 0);
    return (termOrder[b?.termType] || 0) - (termOrder[a?.termType] || 0);
};

/**
 * 교수용 학기 목록 조회
 * GET /api/v1/professor/academic-terms
 */
export const getProfessorAcademicTermsRaw = async () => {
    const res = await axiosInstance.get(`${BASE_URL}/api/v1/professor/academic-terms`);
    return res.data;
};

/**
 * 현재 academicTermId를 최대한 정확히 추정해서 반환 (교수용)
 *
 * 우선순위:
 * 1) `/enrollments/periods/current` 에서 term.id가 있으면 그대로 사용
 * 2) term.year + term.termType 로 `/professor/academic-terms` 목록에서 매칭
 * 3) 그래도 못 찾으면 목록에서 최신(정렬 기준) 학기를 선택
 *
 * @returns {Promise<{id:number, year?:number, termType?:string, termName?:string} | null>}
 */
export const getCurrentAcademicTermForProfessor = async () => {
    let currentTerm = null;

    // 1) 현재 활성 기간에서 term 정보 확보 (있으면 id까지)
    try {
        const res = await axiosInstance.get(`${BASE_URL}/api/v1/enrollments/periods/current`);
        const term = res?.data?.data?.currentPeriod?.term;
        if (term) {
            currentTerm = {
                id: term.id,
                year: term.year,
                termType: term.termType,
                termName: term.termName,
            };
        }
    } catch {
        // 무시: academic-terms 목록으로 fallback
    }

    // 2) academic-terms 목록에서 id 확정
    try {
        const raw = await getProfessorAcademicTermsRaw();
        const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        if (list.length === 0) return currentTerm?.id ? currentTerm : null;

        // term.id가 이미 있으면 그대로 반환 (목록에 없어도 우선 사용)
        if (currentTerm?.id !== null && currentTerm?.id !== undefined) {
            return currentTerm;
        }

        // year/termType로 매칭
        if (currentTerm?.year && currentTerm?.termType) {
            const matched = list.find(
                (t) => Number(t?.year) === Number(currentTerm.year) && String(t?.termType) === String(currentTerm.termType)
            );
            if (matched?.id !== null && matched?.id !== undefined) {
                return {
                    id: matched.id,
                    year: matched.year,
                    termType: matched.termType,
                    termName: matched.termName,
                };
            }
        }

        // 최신 학기 선택
        const sorted = [...list].sort(sortTermsDesc);
        const top = sorted[0];
        return top?.id !== null && top?.id !== undefined
            ? {id: top.id, year: top.year, termType: top.termType, termName: top.termName}
            : null;
    } catch {
        return currentTerm?.id ? currentTerm : null;
    }
};

/**
 * 현재 학기 조회 (공통: 학생/교수)
 * GET /api/v1/academic-terms/current
 *
 * @returns {Promise<{id:number, year?:number, termType?:string, startDate?:string, endDate?:string} | null>}
 */
export const getCurrentAcademicTerm = async () => {
    try {
        const res = await axiosInstance.get(`${BASE_URL}/api/v1/academic-terms/current`);
        const d = res?.data?.data || null;
        if (!d?.id) return null;
        return d;
    } catch {
        return null;
    }
};


