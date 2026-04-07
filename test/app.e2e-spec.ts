import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { MailService } from '@core/mail';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue({
        sendMail: jest.fn(),
      })
      .compile();

    const adapter = new FastifyAdapter();
    app = moduleFixture.createNestApplication(adapter);
    await app.init();
    await adapter.getInstance().ready();
  });

  afterAll(async () => {
    const instance = app.getHttpAdapter().getInstance();
    await app.close();
    await instance.close();

    await new Promise((resolve) => setImmediate(resolve));
  });

  it('/ (GET) - Redirects to health', () => {
    return request(app.getHttpServer()).get('/').expect(302).expect('location', 'health');
  });

  it('/health (GET) - Returns health status', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect((res.body as { status: string }).status).toBe('ok');
      });
  });
});
