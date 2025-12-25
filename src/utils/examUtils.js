/**
 * exam.questionData가 object 또는 JSON string으로 내려오는 케이스를 모두 처리
 * @returns {{ questions: any[] }}
 */
export const normalizeQuestionData = (questionData) => {
    if (!questionData) return {questions: []};

    // 이미 정상 객체
    if (typeof questionData === 'object') {
        const q = Array.isArray(questionData.questions) ? questionData.questions : [];
        return {...questionData, questions: q};
    }

    // JSON string
    if (typeof questionData === 'string') {
        const raw = questionData.trim();
        if (!raw) return {questions: []};
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                const q = Array.isArray(parsed.questions) ? parsed.questions : [];
                return {...parsed, questions: q};
            }
            return {questions: []};
        } catch {
            return {questions: []};
        }
    }

    return {questions: []};
};


