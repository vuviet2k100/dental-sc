import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app/app.module';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
describe('AppController (e2e)', () => {
  let app: INestApplication; // Bỏ <App> đi cho đỡ lỗi kiểu

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('AppController (e2e)', () => {
  it('/ (GET)', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

  afterAll(async () => { // Nên dùng afterAll thay vì afterEach để tối ưu performance
    await app.close();
  });
});

function afterAll(arg0: () => Promise<void>) {
  throw new Error('Function not implemented.');
}
