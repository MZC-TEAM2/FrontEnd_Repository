/**
 * 이수구분 코드 매핑
 */
export const courseTypeMap = {
    '전공필수': 1,
    '전공선택': 2,
    '교양필수': 3,
    '교양선택': 4,
};

/**
 * 이수구분 코드를 숫자로 변환
 * @param {string} courseTypeName - 이수구분 이름
 * @returns {number|null} 이수구분 코드
 */
export const getCourseTypeCode = (courseTypeName) => {
    return courseTypeMap[courseTypeName] || null;
};

