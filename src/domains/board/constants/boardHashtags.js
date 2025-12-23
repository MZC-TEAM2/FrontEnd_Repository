/**
 * 게시판별 해시태그 상수 정의
 * 각 게시판의 주제/카테고리별 해시태그 목록을 관리합니다.
 */

// 자유 게시판 해시태그
export const FREE_HASHTAGS = [
  { id: '대학생활', name: '대학생활', icon: '🎓', color: '#1976d2' },
  { id: '맛집추천', name: '맛집추천', icon: '🍽️', color: '#d32f2f' },
  { id: '동아리', name: '동아리', icon: '👥', color: '#0288d1' },
  { id: '취미', name: '취미', icon: '🎨', color: '#9c27b0' },
  { id: '일상', name: '일상', icon: '☀️', color: '#f57c00' },
  { id: '고민상담', name: '고민상담', icon: '💭', color: '#388e3c' },
];

// 질문 게시판 해시태그 (전 학과 공통)
export const QUESTION_HASHTAGS = [
  { id: '과제질문', name: '과제질문', icon: '📝', color: '#1976d2' },
  { id: '시험준비', name: '시험준비', icon: '📖', color: '#9c27b0' },
  { id: '개념이해', name: '개념이해', icon: '💡', color: '#0288d1' },
  { id: '문제풀이', name: '문제풀이', icon: '✏️', color: '#388e3c' },
  { id: '학습자료', name: '학습자료', icon: '📚', color: '#f57c00' },
  { id: '프로젝트', name: '프로젝트', icon: '🚀', color: '#d32f2f' },
  { id: '실습질문', name: '실습질문', icon: '🔬', color: '#1976d2' },
];

// 토론 게시판 해시태그
export const DISCUSSION_HASHTAGS = [
  { id: 'ai윤리토론', name: 'AI윤리토론', icon: '🤖', color: '#1976d2' },
  { id: '기후변화대응', name: '기후변화대응', icon: '🌱', color: '#388e3c' },
  { id: '교육개혁', name: '교육개혁', icon: '🏫', color: '#f57c00' },
  { id: '메타버스미래', name: '메타버스미래', icon: '🕹️', color: '#0288d1' },
  { id: '청년정책', name: '청년정책', icon: '👥', color: '#9c27b0' },
  { id: 'esg경영', name: 'ESG경영', icon: '🌿', color: '#388e3c' },
  { id: '디지털전환', name: '디지털전환', icon: '💻', color: '#1976d2' },
  { id: '사회적가치', name: '사회적가치', icon: '❤️', color: '#d32f2f' },
];

// 학과 게시판 해시태그
export const DEPARTMENT_HASHTAGS = [
  { id: '학과공지', name: '학과공지', icon: '📢', color: '#1976d2' },
  { id: '전공수업', name: '전공수업', icon: '📚', color: '#9c27b0' },
  { id: '졸업요건', name: '졸업요건', icon: '🎓', color: '#0288d1' },
  { id: '학과행사', name: '학과행사', icon: '🎉', color: '#f57c00' },
  { id: '교수님공지', name: '교수님공지', icon: '👨‍🏫', color: '#d32f2f' },
  { id: '학과세미나', name: '학과세미나', icon: '📊', color: '#388e3c' },
  { id: '졸업논문', name: '졸업논문', icon: '📝', color: '#1976d2' },
  { id: '학과동아리', name: '학과동아리', icon: '👥', color: '#9c27b0' },
];

// 공모전 게시판 해시태그
export const CONTEST_HASHTAGS = [
  { id: 'it/소프트웨어', name: 'IT/소프트웨어', icon: '💻', color: '#1976d2' },
  { id: '디자인', name: '디자인', icon: '🎨', color: '#9c27b0' },
  { id: '마케팅', name: '마케팅', icon: '📊', color: '#0288d1' },
  { id: '아이디어', name: '아이디어', icon: '💡', color: '#f57c00' },
  { id: '창업', name: '창업', icon: '🚀', color: '#d32f2f' },
  { id: '사회혁신', name: '사회혁신', icon: '🌱', color: '#388e3c' },
];

// 스터디 모집 게시판 해시태그
export const STUDY_HASHTAGS = [
  { id: '코딩테스트', name: '코딩테스트', icon: '💻', color: '#1976d2' },
  { id: '자격증', name: '자격증', icon: '📜', color: '#9c27b0' },
  { id: '프로젝트', name: '프로젝트', icon: '🚀', color: '#0288d1' },
  { id: '토익토스', name: '토익토스', icon: '🗣️', color: '#f57c00' },
  { id: '전공공부', name: '전공공부', icon: '📚', color: '#388e3c' },
];

// 취업정보 게시판 해시태그
export const CAREER_HASHTAGS = [
  { id: '채용공고', name: '채용공고', icon: '📢', color: '#1976d2' },
  { id: '면접후기', name: '면접후기', icon: '💼', color: '#9c27b0' },
  { id: '인턴', name: '인턴', icon: '🎓', color: '#0288d1' },
  { id: '자소서첨삭', name: '자소서첨삭', icon: '✍️', color: '#f57c00' },
  { id: '포트폴리오', name: '포트폴리오', icon: '📁', color: '#388e3c' },
  { id: '이력서', name: '이력서', icon: '📄', color: '#d32f2f' },
];

// 학생 게시판 해시태그
export const STUDENT_HASHTAGS = [
  { id: '학업고민', name: '학업고민', icon: '📚', color: '#1976d2' },
  { id: '진로상담', name: '진로상담', icon: '🎯', color: '#9c27b0' },
  { id: '대외활동', name: '대외활동', icon: '🌟', color: '#0288d1' },
  { id: '학생회', name: '학생회', icon: '🏛️', color: '#f57c00' },
  { id: '동아리모집', name: '동아리모집', icon: '👥', color: '#388e3c' },
];

// 게시판 타입별 해시태그 매핑
export const BOARD_HASHTAGS_MAP = {
  FREE: FREE_HASHTAGS,
  QUESTION: QUESTION_HASHTAGS,
  DISCUSSION: DISCUSSION_HASHTAGS,
  DEPARTMENT: DEPARTMENT_HASHTAGS,
  CONTEST: CONTEST_HASHTAGS,
  STUDY_RECRUITMENT: STUDY_HASHTAGS,
  CAREER: CAREER_HASHTAGS,
  STUDENT: STUDENT_HASHTAGS,
};

// 게시판 타입 한글 레이블 매핑
export const BOARD_TYPE_LABELS = {
  FREE: '자유게시판',
  QUESTION: '질문게시판',
  DISCUSSION: '토론게시판',
  STUDENT: '학생게시판',
  CONTEST: '공모전게시판',
  CAREER: '취업정보게시판',
  STUDY_RECRUITMENT: '스터디모집게시판',
  DEPARTMENT: '학과게시판',
  NOTICE: '공지사항',
  PROFESSOR: '교수게시판',
  ASSIGNMENT: '과제게시판',
  EXAM: '시험게시판',
  QUIZ: '퀴즈게시판',
};

/**
 * 게시판 타입으로 해시태그 목록 가져오기
 * @param {string} boardType - 게시판 타입 (FREE, QUESTION, etc.)
 * @returns {Array} 해시태그 목록
 */
export const getBoardHashtags = (boardType) => {
  return BOARD_HASHTAGS_MAP[boardType] || [];
};

/**
 * 게시판 타입으로 한글 레이블 가져오기
 * @param {string} boardType - 게시판 타입 (FREE, QUESTION, etc.)
 * @returns {string} 한글 레이블
 */
export const getBoardTypeLabel = (boardType) => {
  return BOARD_TYPE_LABELS[boardType] || boardType;
};
