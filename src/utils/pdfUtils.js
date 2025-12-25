import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * DOM 요소를 캡처해서 PDF로 저장합니다.
 * - 한글/스타일은 캔버스에 렌더링된 이미지를 PDF에 넣는 방식이라 폰트 임베딩 이슈가 적습니다.
 *
 * @param {Object} params
 * @param {HTMLElement} params.element - 캡처할 DOM 요소
 * @param {string} params.filename - 저장 파일명 (.pdf)
 * @param {'portrait'|'landscape'} [params.orientation]
 */
export async function exportElementToPdf({element, filename, orientation = 'landscape'}) {
    if (!element) throw new Error('PDF로 저장할 영역을 찾을 수 없습니다.');

    const canvas = await html2canvas(element, {
        scale: Math.min(2, window.devicePixelRatio || 1),
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        onclone: (doc) => {
            try {
                doc.documentElement.style.background = '#ffffff';
                if (doc.body) {
                    doc.body.style.background = '#ffffff';
                    // 색상/배경이 회색으로 빠지는 현상 방지(브라우저/렌더러별 편차)
                    doc.body.style.webkitPrintColorAdjust = 'exact';
                    doc.body.style.printColorAdjust = 'exact';
                }

                // 테이블 셀의 투명 배경이 PDF에서 회색으로 보이는 케이스 방지
                const nodes = doc.querySelectorAll('table, thead, tbody, tr, th, td');
                nodes.forEach((el) => {
                    el.style.webkitPrintColorAdjust = 'exact';
                    el.style.printColorAdjust = 'exact';
                    // inline background가 없는 경우만 흰색으로 채움
                    const bg = el.style.backgroundColor;
                    if (!bg) el.style.backgroundColor = '#ffffff';
                });
            } catch {
                // ignore
            }
        },
    });

    const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 큰 이미지를 y로 밀어 넣는 방식은 일부 뷰어에서 하단이 잘리는 케이스가 있어
    // 캔버스를 A4 페이지 높이만큼 슬라이스해서 페이지별로 추가한다.
    const imgWidthMm = pageWidth;
    const pageHeightPx = Math.floor(canvas.width * (pageHeight / pageWidth)); // mm 비율을 px로 변환

    let renderedHeightPx = 0;
    let pageIndex = 0;

    while (renderedHeightPx < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx);

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;

        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) throw new Error('PDF 생성에 실패했습니다. (canvas context)');

        ctx.drawImage(
            canvas,
            0,
            renderedHeightPx,
            canvas.width,
            sliceHeightPx,
            0,
            0,
            canvas.width,
            sliceHeightPx
        );

        const imgData = sliceCanvas.toDataURL('image/png');
        const sliceHeightMm = (sliceHeightPx * imgWidthMm) / canvas.width;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMm, sliceHeightMm);

        renderedHeightPx += sliceHeightPx;
        pageIndex += 1;
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}


