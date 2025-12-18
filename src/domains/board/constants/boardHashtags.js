/**
 * 게시판별 해시태그 상수 정의
 * 각 게시판의 주제/카테고리별 해시태그 목록을 관리합니다.
 */

// 자유 게시판 해시태그
export const FREE_HASHTAGS = [
  { id: '대학생활', name: '대학생활', icon: '🎓', color: 'primary' },
  { id: '맛집추천', name: '맛집추천', icon: '🍽️', color: 'error' },
  { id: '동아리', name: '동아리', icon: '👥', color: 'info' },
  { id: '취미', name: '취미', icon: '🎨', color: 'secondary' },
  { id: '일상', name: '일상', icon: '☀️', color: 'warning' },
  { id: '고민상담', name: '고민상담', icon: '💭', color: 'success' },
];

// 질문 게시판 해시태그
export const QUESTION_HASHTAGS = [
  { id: '자료구조', name: '자료구조', icon: '📊', color: 'primary' },
  { id: '알고리즘', name: '알고리즘', icon: '🧮', color: 'secondary' },
  { id: '데이터베이스', name: '데이터베이스', icon: '💾', color: 'info' },
  { id: '웹개발', name: '웹개발', icon: '🌐', color: 'success' },
  { id: '운영체제', name: '운영체제', icon: '💻', color: 'warning' },
  { id: '네트워크', name: '네트워크', icon: '🔗', color: 'error' },
  { id: 'AI', name: 'AI', icon: '🤖', color: 'primary' },
];

// 토론 게시판 해시태그
export const DISCUSSION_HASHTAGS = [
  { id: '시사', name: '시사', icon: '📰', color: 'primary' },
  { id: '정치', name: '정치', icon: '🏛️', color: 'error' },
  { id: '경제', name: '경제', icon: '💰', color: 'warning' },
  { id: '사회', name: '사회', icon: '👥', color: 'info' },
  { id: '문화', name: '문화', icon: '🎭', color: 'secondary' },
  { id: '과학기술', name: '과학기술', icon: '🔬', color: 'success' },
  { id: '환경', name: '환경', icon: '🌱', color: 'success' },
];

// 학과 게시판 해시태그
export const DEPARTMENT_HASHTAGS = [
  { id: '컴퓨터공학과', name: '컴퓨터공학과', icon: '💻', color: 'primary' },
  { id: '경영학과', name: '경영학과', icon: '💼', color: 'warning' },
  { id: '기계공학과', name: '기계공학과', icon: '⚙️', color: 'secondary' },
  { id: '전자공학과', name: '전자공학과', icon: '🔌', color: 'info' },
  { id: '화학공학과', name: '화학공학과', icon: '🧪', color: 'success' },
  { id: '영어영문학과', name: '영어영문학과', icon: '📚', color: 'error' },
  { id: '수학과', name: '수학과', icon: '📐', color: 'primary' },
];

// 공모전 게시판 해시태그
export const CONTEST_HASHTAGS = [
  { id: 'IT/소프트웨어', name: 'IT/소프트웨어', icon: '💻', color: 'primary' },
  { id: '디자인', name: '디자인', icon: '🎨', color: 'secondary' },
  { id: '마케팅', name: '마케팅', icon: '📊', color: 'info' },
  { id: '아이디어', name: '아이디어', icon: '💡', color: 'warning' },
  { id: '창업', name: '창업', icon: '🚀', color: 'error' },
  { id: '사회혁신', name: '사회혁신', icon: '🌱', color: 'success' },
];

// 스터디 모집 게시판 해시태그
export const STUDY_HASHTAGS = [
  { id: '코딩테스트', name: '코딩테스트', icon: '💻', color: 'primary' },
  { id: '자격증', name: '자격증', icon: '📜', color: 'secondary' },
  { id: '프로젝트', name: '프로젝트', icon: '🚀', color: 'info' },
  { id: '토익토스', name: '토익토스', icon: '🗣️', color: 'warning' },
  { id: '전공공부', name: '전공공부', icon: '📚', color: 'success' },
];

// 취업정보 게시판 해시태그
export const CAREER_HASHTAGS = [
  { id: '채용공고', name: '채용공고', icon: '📢', color: 'primary' },
  { id: '면접후기', name: '면접후기', icon: '💼', color: 'secondary' },
  { id: '인턴', name: '인턴', icon: '🎓', color: 'info' },
  { id: '자소서첨삭', name: '자소서첨삭', icon: '✍️', color: 'warning' },
  { id: '포트폴리오', name: '포트폴리오', icon: '📁', color: 'success' },
  { id: '이력서', name: '이력서', icon: '📄', color: 'error' },
];

// 학생 게시판 해시태그
export const STUDENT_HASHTAGS = [
  { id: '학업고민', name: '학업고민', icon: '📚', color: 'primary' },
  { id: '진로상담', name: '진로상담', icon: '🎯', color: 'secondary' },
  { id: '대외활동', name: '대외활동', icon: '🌟', color: 'info' },
  { id: '학생회', name: '학생회', icon: '🏛️', color: 'warning' },
  { id: '동아리모집', name: '동아리모집', icon: '👥', color: 'success' },
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

/**
 * 게시판 타입으로 해시태그 목록 가져오기
 * @param {string} boardType - 게시판 타입 (FREE, QUESTION, etc.)
 * @returns {Array} 해시태그 목록
 */
export const getBoardHashtags = (boardType) => {
  return BOARD_HASHTAGS_MAP[boardType] || [];
};
