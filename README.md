# 말결 · 한국어 방언 아카이브

경상·전라·충청·강원·제주 다섯 권역의 방언을 어휘와 문법, 예문으로 모아 견주어 보는 정적 웹 아카이브입니다. GitHub Pages로 배포되며 `gstalk.kro.kr` 도메인을 사용합니다.

## 무엇을 담았나

- **어휘 60개** — 권역마다 11~13개씩 균형 있게 배치했습니다. 방언형·표준어·뜻·품사·갈래·음운 노트·문법 노트·지역·세대·예문·태그를 함께 기록합니다.
- **문법 18개** — 권역별 대표 종결어미, 연결어미, 조사, 어간 변화 항목입니다.
- **비교 11개** — 표준어 개념 하나에 다섯 권역의 대응 어형을 나란히 놓은 표입니다.

## 구성

| 경로 | 내용 |
| --- | --- |
| `index.html` | 히어로, 오늘의 방언(무작위), 빠른 검색, 5대 권역 바로가기, 전체 통계 |
| `dictionary.html` | 실시간 검색, 권역·품사·갈래·세대 필터, URL 쿼리(`?region=경상`, `?q=검색어`) |
| `compare.html` | 표준어 하나에 다섯 권역을 놓은 비교표, 표준어 ↔ 방언 예문 비교 |
| `grammar.html` | 권역별 문법 항목 카드 |
| `quiz.html` | 뜻 맞히기·지역 맞히기 5문제 라운드, 즉시 피드백과 해설, 점수와 다시 풀기 |
| `archive.html` | 화자 동의 원칙과 동의된 음성 필터(현재 공개 음성 없음) |
| `generation.html` | 권역별 어휘 분포, 세대 태그 분포, 갈래별 분포 막대 그래프 |
| `about.html` | 취지, 범위, 검증·출처, 음성 동의, 한계 |
| `css/style.css` | 다크 에디토리얼 디자인 시스템, 권역별 컬러 토큰, 반응형(360px~) |
| `js/` | 페이지별 기능과 공통 데이터 로더 |
| `data/` | `lexicon.json`, `grammar.json`, `compare.json` |
| `audio/` | 화자 동의를 확인한 음성 파일 자리 |

## 데이터 스키마

`data/lexicon.json`의 항목 하나는 다음 구조를 따릅니다.

```json
{
  "id": "gs-0001",
  "dialect_form": "어데",
  "standard_form": "어디",
  "meaning": "장소를 묻거나 가리키는 말",
  "part_of_speech": "부사",
  "category": "lexical",
  "phonological_note": "…",
  "grammatical_note": "…",
  "region": { "province": "경남", "city": "부산", "sub_dialect": "경남 동부", "macro_region": "경상" },
  "generation": ["노년", "중년"],
  "example_sentences": [{ "dialect": "니 어데 가노?", "standard": "너 어디 가니?", "sentence_type": "설명의문문" }],
  "audio": { "file": "audio/gs-0001.mp3", "consent_obtained": false },
  "related_grammar_ids": ["gr-gs-01"],
  "source": { "type": "reference", "reference": "…", "verified": false },
  "tags": ["장소", "의문", "부산"]
}
```

- `region.macro_region`은 `경상`, `전라`, `충청`, `강원`, `제주` 가운데 하나입니다.
- `category`는 `lexical`(어휘) 또는 `grammatical`(문법)입니다.
- `audio.consent_obtained`가 `false`이면 사이트는 음성을 재생하지 않습니다.

`data/grammar.json`은 `form`, `function`, `standard_equivalent`, `macro_region`, `region_distribution`, `type`, `example`, `note`, `source`를 사용합니다.

`data/compare.json`은 `standard`, `group`, `forms`(권역별 대응 어형), `note`를 사용합니다.

## 원칙

- 표준어와 방언을 우열로 나누지 않습니다.
- 출처를 확인한 항목만 `source.verified: true`로 표시하고, 나머지는 ‘검증 필요’로 남깁니다.
- 화자의 명시적 동의를 받은 음성만 공개합니다.
- 적은 표본으로 지역·세대 전체의 경향을 일반화하지 않습니다.

## 로컬에서 보기

```bash
python3 -m http.server 8000
# http://localhost:8000
```

JSON 데이터를 `fetch`로 읽으므로 `file://`로 직접 열지 말고 위처럼 로컬 서버로 확인합니다.

---

운영 표기: `@muhanu`
