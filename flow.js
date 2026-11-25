// 분기 구조는 와이어프레임(비장애인 v1, 휠체어 v4) 그대로
// 화면 흐름(어떤 영상 다음에 무엇). 자막·문구 수정은 subs.json(edit.html에서 편집)이 우선함
// label: 위치 자막 / q·opts: 선택지 / title·sub: 교시 종료 카드 / stop: 이 초에서 멈추고 다음으로
const G = {
  // ── 1부: 비장애 학생 ──
  w01:{t:'video', src:'walk/01', p:1, label:'안암역 → 갈림길', next:'wQ1', stop:21.9},   // 갈림길 자막 뒤 3초 일찍 끊고 바로 선택지
  wQ1:{t:'choice', p:1, q:'미디어관으로 가는 길, 어디로 갈까?', opts:[['1층 입구 쪽','w02'],['정후 쪽','w03']]},
  w02:{t:'video', src:'walk/02', p:1, label:'1층 입구 → 4층 시네마트랩', next:'wE1'},
  w03:{t:'video', src:'walk/03', p:1, label:'정후 → 미디어관 2층', next:'wQ2'},
  wQ2:{t:'choice', p:1, q:'4층 강의실까지, 어떻게 올라갈까?', opts:[['엘리베이터','w04'],['계단','w06']]},
  w04:{t:'video', src:'walk/04', p:1, label:'2층 엘리베이터 → 4층 시네마트랩', next:'wE1'},
  w06:{t:'video', src:'walk/06', p:1, label:'계단 → 4층 시네마트랩', next:'wE1'},
  wE1:{t:'card', p:1, title:'1교시 끝', sub:'다음 수업은 교양관', next:'w07'},
  w07:{t:'video', src:'walk/07', p:2, label:'시네마트랩 → 1층', next:'w08'},
  w08:{t:'video', src:'walk/08', p:2, label:'교양관 내부 계단', next:'wE2'},
  wE2:{t:'card', p:2, title:'2교시 끝', sub:'다음 수업은 국제관', next:'w09'},
  w09:{t:'video', src:'walk/09', p:3, label:'교양관 → 국제관', next:'w10'},
  w10:{t:'video', src:'walk/10', p:3, label:'국제관 계단길', next:'w11'},
  w11:{t:'video', src:'walk/11', p:3, label:'국제관 강의실', next:'wE3'},
  wE3:{t:'card', p:3, title:'3교시 끝', sub:'오늘 수업 끝!', next:'switch'},
  // ── 2부: 휠체어 이용 학생 ──
  h01:{t:'video', src:'wheel/01', p:1, label:'안암역 → 갈림길', next:'hQ1', stop:26.3},   // 갈림길 자막 뒤 3초 일찍 끊고 바로 선택지
  hQ1:{t:'choice', p:1, q:'미디어관으로 가는 길, 어디로 갈까?', opts:[['1층 입구 쪽','h02'],['정후 쪽','h03']]},
  h02:{t:'video', src:'wheel/02', p:1, label:'1층 입구 → 미디어관 1층', next:'hE1'},
  h03:{t:'video', src:'wheel/03', p:1, label:'정후 → 미디어관 2층', next:'hQ2'},
  hQ2:{t:'choice', p:1, q:'강의실로 가려면 어디로 갈까?', opts:[['2층 입구로 진입','h04'],['계단 쪽','X']]},
  h04:{t:'video', src:'wheel/04', p:1, label:'2층 입구 → 엘리베이터 → 4층 시네마트랩', next:'hE1'},
  hE1:{t:'card', p:1, title:'1교시 끝', sub:'다음 수업은 교양관', next:'h05'},
  h05:{t:'video', src:'wheel/05', p:2, label:'미디어관 → 교양관', next:'hQ3'},
  hQ3:{t:'choice', p:2, q:'교양관으로 가는 길, 어디로 갈까?', opts:[['이동 가능한 길','h06'],['계단 쪽','X']]},
  h06:{t:'video', src:'wheel/06', p:2, label:'미디어관 → 교양관 엘리베이터', next:'hE2'},
  hE2:{t:'card', p:2, title:'2교시 끝', sub:'다음 수업은 국제관', next:'h07'},
  h07:{t:'video', src:'wheel/07', p:3, label:'교양관 → 국제관', next:'hQ4'},
  hQ4:{t:'choice', p:3, q:'국제관으로 가는 길, 어디로 갈까?', opts:[['이동 가능한 길','h08'],['계단 쪽','X']]},
  h08:{t:'video', src:'wheel/08', p:3, label:'교양관 → 국제관', next:'hE3'},
  hE3:{t:'card', p:3, title:'3교시 끝', sub:'오늘 수업 끝!', next:'result'},
};

// 시계: 각 교시 출발 시각, 수업 시간. 영상 속 시계는 원본 촬영 길이(timemap.json)만큼 흘러감
// 휠체어 시계: 촬영 원본 시간 그대로 (뒤에서 사람이 밀어 준 속도. 혼자 밀면 더 걸림)
// 배율 보정은 근거가 약해서 쓰지 않음. PUSH에는 엘리베이터 대기·탑승 구간만 표시(느린 재생 + 대기 시간 표시용)
const PUSH_FLAT = 1;
const PUSH = {
  h02:[[36,51,1]], h04:[[15,47,1]], h05:[[6,23,1]], h06:[[27,41,1]], h07:[[6,13,1]],
};
const CLOCK = {
  depart:{1:'09:21:00', 2:'10:15:00', 3:'11:45:00'},
  cls:{1:['09:30','10:15'], 2:['10:30','11:45'], 3:['12:00','13:15']},
};
