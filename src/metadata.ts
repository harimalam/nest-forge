/* eslint-disable */
export default async () => {
    const t = {
        ["./modules/api/health/dto/health-response.dto"]: await import("./modules/api/health/dto/health-response.dto")
    };
    return { "@nestjs/swagger": { "models": [[import("./modules/api/health/dto/health-response.dto"), { "HealthResponseDto": { status: { required: true, type: () => Object }, timestamp: { required: true, type: () => String } } }]], "controllers": [[import("./app.controller"), { "AppController": { "getHello": {} } }], [import("./modules/api/health/health.controller"), { "HealthController": { "checkLiveness": { type: t["./modules/api/health/dto/health-response.dto"].HealthResponseDto }, "check": { type: Object } } }]] } };
};