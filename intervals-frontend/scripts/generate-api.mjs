import { generateApi } from 'swagger-typescript-api';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

generateApi({
    name: 'Api.ts',
    output: resolve(__dirname, '../src/api'),
    url: 'http://localhost:8080/swagger/doc.json', // URL к Swagger JSON
    httpClientType: 'axios',
    generateResponses: true,
    toJS: false,
    extractRequestParams: true,
    extractRequestBody: true,
    singleHttpClient: true,
    cleanOutput: false,
    enumNamesAsValues: false,
    moduleNameFirstTag: false,
    generateUnionEnums: true,
    extraTemplates: [],
})
    .then(() => {
        console.log('API generated successfully!');
    })
    .catch((error) => {
        console.error('Error generating API:', error);
    });