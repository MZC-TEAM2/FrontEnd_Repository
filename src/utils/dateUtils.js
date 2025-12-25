import {format, isValid, parseISO} from 'date-fns';

/**
 * ISO(또는 유사) 문자열을 "YYYY. MM. DD. HH:mm" 형태로 표시
 * - 파싱 실패 시 원문을 그대로 반환
 */
export const formatDateTimeDot = (value) => {
    if (value == null || value === '') return '-';
    const raw = String(value);
    try {
        const d = parseISO(raw);
        if (!isValid(d)) return raw;
        return format(d, 'yyyy. MM. dd. HH:mm');
    } catch {
        return raw;
    }
};

/**
 * ISO(또는 유사) 문자열을 "YYYY-MM-DD HH:mm" 형태로 표시
 * - 파싱 실패 시 원문을 그대로 반환
 */
export const formatDateTimeDash = (value) => {
    if (value == null || value === '') return '-';
    const raw = String(value);
    try {
        const d = parseISO(raw);
        if (!isValid(d)) return raw;
        return format(d, 'yyyy-MM-dd HH:mm');
    } catch {
        return raw;
    }
};


