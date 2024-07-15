# package.json 파일 상세
프로젝트의 빌드, 포맷팅, 린팅(ts), 테스트, 및 시작을 관리하며, 필요한 종속성 및 개발 종속성 정의

## 파일 정보
- **name**: 프로젝트의 이름
- **version**: 프로젝트의 초기 버전
- **description**: 프로젝트에 대한 설명 (현재 비어 있음)
- **author**: 프로젝트의 작성자
- **private**: 프로젝트가 private임을 나타냄, 즉 npm에 게시되지 않음
- **license**: 라이선스 정보, 현재 라이선스가 없음을 나타냄

## Scripts
- **build**: `nest build` 명령어를 실행하여 프로젝트를 빌드합니다.
- **format**: `prettier --write "src/**/*.ts" "test/**/*.ts"` 명령어를 실행하여 코드를 포맷팅합니다.
- **start**: `nest start` 명령어를 실행하여 애플리케이션을 시작합니다.
- **start:dev**: `nest start --watch` 명령어를 실행하여 개발 모드로 애플리케이션을 시작합니다.
- **start:debug**: `nest start --debug --watch` 명령어를 실행하여 디버그 모드로 애플리케이션을 시작합니다.
- **start:prod**: `node dist/main` 명령어를 실행하여 프로덕션 모드로 애플리케이션을 시작합니다.
- **lint**: `eslint "{src,apps,libs,test}/**/*.ts" --fix` 명령어를 실행하여 코드를 린트하고 자동으로 수정합니다.
- **test**: `jest` 명령어를 실행하여 테스트를 실행합니다.
- **test:watch**: `jest --watch` 명령어를 실행하여 파일 변경 시 자동으로 테스트를 실행합니다.
- **test:cov**: `jest --coverage` 명령어를 실행하여 테스트 커버리지 보고서를 생성합니다.
- **test:debug**: `node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand` 명령어를 실행하여 디버그 모드로 테스트를 실행합니다.
- **test:e2e**: `jest --config ./test/jest-e2e.json` 명령어를 실행하여 E2E (End-to-End) 테스트를 실행합니다.

## Dependencies
- **@nestjs/common**: NestJS 공통 모듈
- **@nestjs/config**: NestJS 설정 모듈
- **@nestjs/core**: NestJS 코어 모듈
- **@nestjs/jwt**: JWT 인증 모듈
- **@nestjs/passport**: Passport 인증 모듈
- **@nestjs/platform-express**: NestJS Express 플랫폼 모듈
- **@nestjs/typeorm**: TypeORM 모듈
- **bcrypt**: 비밀번호 암호화 라이브러리
- **class-transformer**: 클래스 변환기 라이브러리
- **class-validator**: 클래스 검증기 라이브러리
- **cookie-parser**: 쿠키 파서 라이브러리
- **dotenv**: 환경 변수 로드 라이브러리
- **express**: Node.js 웹 애플리케이션 프레임워크
- **js-yaml**: YAML 파싱 라이브러리
- **jsonwebtoken**: JSON Web Token 라이브러리
- **mysql**: MySQL 데이터베이스 드라이버
- **passport**: 인증 미들웨어
- **passport-jwt**: Passport용 JWT 전략
- **reflect-metadata**: 메타데이터 리플렉션을 위한 라이브러리
- **rxjs**: 리액티브 프로그래밍 라이브러리
- **sqlite3**: SQLite 데이터베이스 드라이버
- **typeorm**: TypeORM 데이터베이스 ORM

## DevDependencies
- **@nestjs/cli**: NestJS CLI 도구
- **@nestjs/schematics**: NestJS 스케마틱 도구
- **@nestjs/testing**: NestJS 테스트 도구
- **@types/bcrypt**: Bcrypt의 타입 정의
- **@types/express**: Express의 타입 정의
- **@types/jest**: Jest의 타입 정의
- **@types/js-yaml**: js-yaml의 타입 정의
- **@types/node**: Node.js의 타입 정의
- **@types/supertest**: Supertest의 타입 정의
- **@typescript-eslint/eslint-plugin**: TypeScript를 위한 ESLint 플러그인
- **@typescript-eslint/parser**: TypeScript를 위한 ESLint 파서
- **eslint**: JavaScript 코드 린팅 도구
- **eslint-config-prettier**: Prettier와 ESLint의 충돌을 방지하는 설정
- **eslint-plugin-prettier**: Prettier를 ESLint 플러그인으로 사용
- **jest**: JavaScript 테스팅 프레임워크
- **prettier**: 코드 포매터
- **source-map-support**: 소스 맵 지원 도구
- **supertest**: HTTP assertions을 위한 라이브러리
- **ts-jest**: TypeScript와 Jest를 함께 사용하기 위한 도구
- **ts-loader**: Webpack을 위한 TypeScript 로더
- **ts-node**: Node.js에서 TypeScript를 직접 실행하기 위한 도구
- **tsconfig-paths**: tsconfig.json에 정의된 경로를 Node.js에서 인식할 수 있도록 도와주는 도구
- **typescript**: TypeScript 컴파일러

## Jest 설정
- **moduleFileExtensions**: 테스트할 파일의 확장자 목록 (js, json, ts)
- **rootDir**: Jest의 루트 디렉토리 (test)
- **testRegex**: 테스트 파일의 정규 표현식 (spec.ts로 끝나는 파일)
- **transform**: TypeScript와 JavaScript 파일을 ts-jest로 변환
- **collectCoverageFrom**: 커버리지 수집 대상 파일 (node_modules 디렉토리는 제외)
- **coverageDirectory**: 커버리지 보고서 디렉토리 (../coverage)
- **testEnvironment**: 테스트 환경 설정 (Node.js)

