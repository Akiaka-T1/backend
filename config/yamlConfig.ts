import * as fs from 'fs';
import * as yaml from 'js-yaml';

/*
  주어진 파일 경로에서 YAML 구성 파일을 읽고 환경 변수를 해석하여 반환
  @param filePath - 읽을 YAML 파일의 경로
  @returns 환경 변수가 해석된 구성 객체
 */

export const loadYamlConfig = (filePath: string) => {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const config = yaml.load(fileContents) as Record<string, any>;

  Object.keys(config).forEach(key => {
    if (typeof config[key] === 'object') {
      Object.keys(config[key]).forEach(subKey => {
        if (typeof config[key][subKey] === 'string' && config[key][subKey].startsWith('${') && config[key][subKey].endsWith('}')) {
          const envVar = config[key][subKey].slice(2, -1);
          config[key][subKey] = process.env[envVar];
        }
      });
    }
  });

  return config;
};