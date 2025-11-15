# Monad Grant Console

Chainlink CCIP 기반의 그랜트 집행 툴입니다. USD 예산을 입력하면 Chainlink 데이터 피드에서 실시간 환산가를 가져와 ETH/USDC/LINK 비중을 계산하고, CCIP 멀티체인 전송 계획을 UI에서 설계할 수 있습니다.

## 주요 기능

- **실시간 피드 연동**: `/api/prices` 라우트가 Chainlink Marketplace API를 호출해 최신 가격을 제공하고 폴백 가격으로 복구합니다.
- **예산 슬라이싱**: 총 USD 값을 URL 쿼리(`?amount=`)와 동기화하고 슬라이더로 자산 비율을 자유롭게 조정합니다.
- **CCIP 수령인 관리**: 체인 셀렉터, 지갑 주소, 자산, USD 지분을 입력하면 즉시 토큰 수량과 체인별 요약을 계산합니다.
- **시뮬레이션 로그**: 전송 준비 시 체인·주소별 로그를 쌓아 실제 CCIP 실행 전에 검증할 수 있습니다.

## 기술 스택

- Next.js 16 App Router, React 19
- TypeScript 5, Zod, 커스텀 쿼리 상태 훅
- Tailwind CSS 4 + 커스텀 다크 UI
- Chainlink Marketplace API

## 설치 및 실행

```bash
cd monad_frontend
npm install       # 네트워크가 막힌 환경에서는 의존성을 직접 내려받아야 합니다.
npm run dev       # http://localhost:3000
```

> 현재 저장소에서는 외부 네트워크 차단으로 `npm install`이 실패했습니다. 인터넷이 가능한 환경에서 다시 설치해 주세요.

## 디렉터리 개요

```
src/
├─ app/
│  ├─ api/prices/route.ts   # Chainlink 가격 프락시
│  ├─ error.tsx, loading.tsx
│  ├─ layout.tsx, page.tsx
├─ components/grant-tool/
│  ├─ grant-console.tsx     # 인트로 + Suspense
│  └─ grant-form.tsx        # 메인 UI + 상태 관리
├─ config/
│  ├─ assets.ts             # 지원 자산 메타데이터
│  └─ chains.ts             # CCIP 체인 셀렉터/라우터
├─ hooks/use-price-feeds.ts # 60초 주기 폴링 훅
└─ lib/format.ts            # 숫자 포맷 유틸
```

## API: GET `/api/prices`

| 파라미터 | 설명 | 기본값 |
| --- | --- | --- |
| `symbols` | `ETH,USDC,LINK` 형태의 심볼 CSV | 모든 지원 자산 |

### 응답 예시

```json
{
  "timestamp": "2024-05-12T09:00:00.000Z",
  "prices": [
    {"symbol": "ETH", "price": 3250.12, "updatedAt": "…", "source": "chainlink-marketplace", "isFallback": false},
    {"symbol": "USDC", "price": 0.999, "updatedAt": "…", "source": "chainlink-marketplace", "isFallback": false}
  ]
}
```

## 작업 이력 요약

- Next.js 프로젝트를 TypeScript 기반으로 전환하고 레이아웃/페이지 구조를 재구성했습니다.
- Chainlink 자산·체인 설정, 포맷 유틸, 가격 API 라우트, 가격 폴링 훅을 추가했습니다.
- 그랜트 UI 전반(예산 입력, 슬라이더, 수령인 테이블, 체인별 요약, 시뮬 로그, 에러/로딩 바운더리)을 구현했습니다.
