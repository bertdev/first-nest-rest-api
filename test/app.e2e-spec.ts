import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDd();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@test.com',
      password: 'supersecretpassword'
    };

    describe('Signup', () => {
      it('Should throw an error if email are empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: '',
            password: dto.password
          })
          .expectStatus(400);
      });

      it('Should throw an error if email are invalid', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: 'test',
            password: dto.password
          })
          .expectStatus(400);
      });

      it('Should throw an error if password are empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
            password: ''
          })
          .expectStatus(400);
      });

      it('Should throw an error if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      });

      it('Should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('Should throw an error if email are empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: '',
            password: dto.password
          })
          .expectStatus(400);
      });

      it('Should throw an error if email are invalid', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'test',
            password: dto.password
          })
          .expectStatus(400);
      });

      it('Should throw an error if password are empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
            password: ''
          })
          .expectStatus(400);
      });

      it('Should throw an error if password are wrong', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
            password: 'wrong'
          })
          .expectStatus(403);
      });

      it('Should throw an error if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
      });

      it('Should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => { });
    describe('Edit user', () => { });
  });

  describe('Bookmark', () => {
    describe('Create bookmark', () => { });
    describe('Get bookmarks', () => { });
    describe('Get bookmark by id', () => { });
    describe('Edit bookmark', () => { });
    describe('Delet bookmark', () => { });
  });

});
