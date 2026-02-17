# 📅 Work Calendar - 근무표 관리 시스템

근무 일정을 시각적으로 관리하고 변경할 수 있는 웹 애플리케이션입니다.

## 🚀 기능

- 📋 달력 형식의 근무표 조회
- 🔐 관리자 로그인 (세션 기반)
- ✏️ 근무 타입 변경 (주/야/휴)
- 📱 반응형 디자인 (모바일 지원)
- 🔄 실시간 동기화

## 🛠️ 기술 스택

### Frontend

- React 18 + TypeScript
- Vite (번들러)
- TailwindCSS (스타일링)
- FullCalendar (달력)
- Axios (HTTP 클라이언트)

### Backend

- FastAPI (Python 웹 프레임워크)
- SQLModel (ORM)
- PostgreSQL (데이터베이스)
- Uvicorn (ASGI 서버)

## 📦 프로젝트 구조

```
work-calendar/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # 인증 관련 컴포넌트
│   │   │   ├── calendar/       # 달력 컴포넌트
│   │   │   └── ui/             # UI 컴포넌트
│   │   ├── api/                # API 호출 함수
│   │   ├── routes/             # 페이지 라우트
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # FastAPI 백엔드
│   ├── main.py                 # 메인 애플리케이션
│   ├── models.py               # 데이터 모델
│   ├── database.py             # DB 설정
│   ├── requirements.txt        # Python 의존성
│   └── Procfile                # 배포 설정
├── docker-compose.yml          # Docker 컨테이너 설정
├── .gitignore                  # Git 무시 파일
├── DEPLOYMENT.md               # 배포 가이드
└── README.md                   # 이 파일
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- Python 3.9+
- PostgreSQL 12+ (또는 Docker)

### 로컬 개발 환경 설정

#### 1. 저장소 클론

```bash
git clone https://github.com/YOUR_USERNAME/work-calendar.git
cd work-calendar
```

#### 2. 환경 변수 설정

**Backend (.env 파일 생성)**

```bash
cd backend
cp .env.example .env
# .env 파일을 편집하여 설정 (선택사항, 기본값 사용 가능)
```

**Frontend (.env 파일 생성)**

```bash
cd ../frontend
cp .env.example .env
# .env 파일을 편집하여 설정 (선택사항, 기본값 사용 가능)
```

#### 3. Docker Compose로 PostgreSQL 실행 (선택사항)

```bash
cd ..
docker-compose up -d
```

> 또는 로컬 PostgreSQL 사용 시 `backend/.env`의 `DATABASE_URL` 수정

#### 4. Backend 실행

```bash
cd backend

# 가상 환경 생성
python -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
uvicorn main:app --reload
```

백엔드가 `http://localhost:8000`에서 실행됩니다.

#### 5. Frontend 실행 (새 터미널에서)

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

#### 6. 브라우저에서 확인

```
http://localhost:5173
```

로그인 버튼 → 기본 비밀번호: `admin123` (또는 `.env`에서 설정한 값)

## 🔐 기본 비밀번호 변경

**Backend .env 파일**

```
ADMIN_PASSWORD=your_secure_password_here
```

그 후 백엔드 서버 재시작

## 📚 API 문서

백엔드 실행 중:

```
http://localhost:8000/docs
```

Swagger UI에서 모든 API를 확인하고 테스트할 수 있습니다.

## 🌐 배포

### 무료 배포 (Vercel + Railway)

자세한 배포 가이드는 [`DEPLOYMENT.md`](./DEPLOYMENT.md) 참고

#### 빠른 요약:

1. GitHub에 코드 push
2. Vercel에서 프론트엔드 배포
3. Railway에서 백엔드 + DB 배포
4. 환경 변수 연결

> 완전히 무료입니다! 💰

## 🧪 테스트

### Frontend 테스트

```bash
cd frontend
npm run lint
```

### Backend 테스트 (선택사항)

```bash
cd backend
pytest
```

## 📝 개발 가이드

### Frontend 추가 기능 개발

1. `frontend/src/` 에서 컴포넌트 작성
2. `frontend/src/api/` 에서 API 호출 함수 작성
3. 변경사항 테스트 후 커밋

### Backend API 추가

1. `backend/main.py` 에서 엔드포인트 작성
2. `backend/models.py` 에서 필요시 데이터 모델 추가
3. API 문서(`/docs`)에서 테스트

## 🐛 알려진 문제 및 해결

### "포트가 이미 사용 중입니다"

```bash
# 다른 포트 사용
uvicorn main:app --reload --port 8001
```

### "CORS 오류"

백엔드 `main.py` 의 `origins` 리스트 확인

### "데이터베이스 연결 실패"

```bash
# PostgreSQL 실행 중인지 확인
docker-compose ps

# 또는 DATABASE_URL 확인
cat backend/.env
```

## 📞 지원

- 문제 발생: GitHub Issues 등록
- 개선 사항: Pull Request 제출

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 🙏 기여

PR과 이슈는 언제나 환영합니다!

---

**Happy Coding!** 🎉
