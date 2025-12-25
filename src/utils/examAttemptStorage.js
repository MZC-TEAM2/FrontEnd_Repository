const RESULT_KEY_PREFIX = 'examResult:';
const INPROGRESS_KEY_PREFIX = 'examInProgress:';
const EVENT_NAME = 'examAttemptStorageUpdated';

const emit = () => {
    try {
        window.dispatchEvent(new Event(EVENT_NAME));
    } catch {
        // ignore
    }
};

const safeParse = (raw) => {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const safeStringify = (obj) => {
    try {
        return JSON.stringify(obj);
    } catch {
        return null;
    }
};

export const getExamLocalResult = (examId) => {
    if (examId == null || examId === '') return null;
    try {
        return safeParse(localStorage.getItem(`${RESULT_KEY_PREFIX}${examId}`));
    } catch {
        return null;
    }
};

export const setExamLocalResult = (examId, result) => {
    if (examId == null || examId === '') return;
    const raw = safeStringify(result || {});
    if (!raw) return;
    try {
        localStorage.setItem(`${RESULT_KEY_PREFIX}${examId}`, raw);
        emit();
    } catch {
        // ignore
    }
};

export const getExamLocalInProgress = (examId) => {
    if (examId == null || examId === '') return null;
    try {
        return safeParse(localStorage.getItem(`${INPROGRESS_KEY_PREFIX}${examId}`));
    } catch {
        return null;
    }
};

export const setExamLocalInProgress = (examId, meta) => {
    if (examId == null || examId === '') return;
    const raw = safeStringify(meta || {});
    if (!raw) return;
    try {
        localStorage.setItem(`${INPROGRESS_KEY_PREFIX}${examId}`, raw);
        emit();
    } catch {
        // ignore
    }
};

export const clearExamLocalInProgress = (examId) => {
    if (examId == null || examId === '') return;
    try {
        localStorage.removeItem(`${INPROGRESS_KEY_PREFIX}${examId}`);
        emit();
    } catch {
        // ignore
    }
};

export const onExamAttemptStorageUpdated = (handler) => {
    if (typeof handler !== 'function') return () => {
    };
    try {
        window.addEventListener(EVENT_NAME, handler);
    } catch {
        return () => {
        };
    }
    return () => {
        try {
            window.removeEventListener(EVENT_NAME, handler);
        } catch {
            // ignore
        }
    };
};


