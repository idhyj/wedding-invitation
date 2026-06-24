// 이 파일을 config.js 로 복사한 뒤 값을 채워 주세요.
// cp config.example.js config.js

window.RSVP_CONFIG = {
  // Google Apps Script Web App 배포 URL (/exec 로 끝나야 함)
  endpoint: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',

  // Apps Script 속성 RSVP_SECRET 과 동일하게 설정 (선택)
  secret: 'your-shared-secret'
};

window.SHARE_CONFIG = {
  // 배포된 청첩장 URL (카톡 공유·링크 복사에 사용)
  siteUrl: 'https://your-vercel-url.vercel.app/'
};
