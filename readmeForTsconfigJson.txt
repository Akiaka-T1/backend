# tsconfig.json 파일 상세
TypeScript 컴파일러 옵션을 설정하는 파일의 상세. TypeScript 프로젝트 실시간 컴파일이나 빌드시 사용 옵션 정의에 사용됨

## compilerOptions

- **module**: `"commonjs"` - 모듈 시스템을 CommonJS로 설정합니다.
- **declaration**: `true` - `.d.ts` 파일을 생성하여 타입 선언을 포함합니다.
- **removeComments**: `true` - 컴파일된 파일에서 주석을 제거합니다.
- **emitDecoratorMetadata**: `true` - 런타임에 타입 정보를 유지하기 위해 데코레이터 메타데이터를 생성합니다.
- **experimentalDecorators**: `true` - 실험적인 데코레이터 기능을 활성화합니다.
- **allowSyntheticDefaultImports**: `true` - 기본값 내보내기가 없는 모듈에서 기본값 가져오기를 허용합니다.
- **target**: `"ES2021"` - ECMAScript 2021 버전으로 타겟을 설정합니다.
- **sourceMap**: `true` - `.map` 파일을 생성하여 소스 맵을 포함합니다.
- **outDir**: `"./dist"` - 컴파일된 파일이 출력될 디렉토리를 설정합니다.
- **baseUrl**: `"./"` - 기본 디렉토리를 설정합니다.
- **incremental**: `true` - 증분 빌드를 활성화하여 빌드 속도를 향상시킵니다.
- **skipLibCheck**: `true` - 라이브러리 파일의 타입 검사를 건너뜁니다.
- **strictNullChecks**: `false` - 엄격한 null 검사를 비활성화합니다.
- **noImplicitAny**: `false` - 암시적인 `any` 타입을 허용합니다.
- **strictBindCallApply**: `false` - `bind`, `call`, `apply` 메서드에 대한 엄격한 타입 검사를 비활성화합니다.
- **forceConsistentCasingInFileNames**: `false` - 파일 이름의 대소문자 일관성을 강제하지 않습니다.
- **noFallthroughCasesInSwitch**: `false` - `switch` 문에서 폴스루를 허용합니다.
- **types**: `["jest","node"]` - 컴파일 시 포함할 타입 정의를 설정합니다.
- **lib**: `["es2021", "dom"]` - 컴파일 시 포함할 라이브러리 파일을 설정합니다.
- **moduleResolution**: `"node"` - 모듈 해석을 Node.js 스타일로 설정합니다.

## include

- **"src/**/*"** - `src` 디렉토리 아래의 모든 파일을 포함하여 컴파일 대상으로 설정합니다.

