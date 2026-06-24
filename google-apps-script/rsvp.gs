/**
 * Wedding RSVP → Google Sheets
 *
 * 설정 방법:
 * 1. 새 Google Sheet 생성
 * 2. 확장 프로그램 → Apps Script → 이 코드 붙여넣기
 * 3. SPREADSHEET_ID 를 본인 시트 ID 로 변경
 * 4. (선택) 프로젝트 설정 → 스크립트 속성 → RSVP_SECRET 추가
 * 5. 배포 → 새 배포 → 웹 앱
 *    - 실행: 나
 *    - 액세스: 모든 사용자
 * 6. /exec URL 을 config.js 의 endpoint 에 입력
 *
 * 브라우저 CORS 이슈로 제출은 doGet 쿼리 방식을 사용합니다.
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = 'RSVP';
const HEADERS = [
  '제출 시간',
  '참석 여부',
  '신랑측/신부측',
  '성함',
  '동행 인원',
  '전할 말씀'
];

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function processRsvp_(body) {
  const secret = PropertiesService.getScriptProperties().getProperty('RSVP_SECRET') || '';

  if (secret && body.secret !== secret) {
    return { ok: false, error: 'Unauthorized' };
  }

  const name = String(body.name || '').trim();
  const attendance = String(body.attendance || '').trim();
  const side = String(body.side || '').trim();
  const message = String(body.message || '').trim();
  const guests = Number(body.guests || 1);

  if (!name || name.length > 30) {
    return { ok: false, error: 'Invalid name' };
  }
  if (!['참석합니다', '참석이 어려워요'].includes(attendance)) {
    return { ok: false, error: 'Invalid attendance' };
  }
  if (!['신랑측', '신부측'].includes(side)) {
    return { ok: false, error: 'Invalid side' };
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > 10) {
    return { ok: false, error: 'Invalid guests' };
  }
  if (message.length > 200) {
    return { ok: false, error: 'Invalid message' };
  }

  const submittedAt = body.submittedAt
    ? new Date(body.submittedAt)
    : new Date();

  const sheet = getSheet_();
  sheet.appendRow([
    Utilities.formatDate(submittedAt, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
    attendance,
    side,
    name,
    guests,
    message
  ]);

  return { ok: true };
}

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.name) {
      return jsonResponse_(processRsvp_(e.parameter));
    }
    return jsonResponse_({ ok: true, message: 'RSVP endpoint ready' });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e.postData && e.postData.contents) || '{}');
    return jsonResponse_(processRsvp_(body));
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err.message || err) });
  }
}
