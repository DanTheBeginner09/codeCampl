import { Static } from '@fastify/type-provider-typebox';
import {
  createSuperRequest,
  defaultUserId,
  devLogin,
  setupServer
} from '../../../jest.utils';
import {
  examEnvironmentPostExamAttempt,
  examEnvironmentPostExamGeneratedExam
} from '../schemas';
import * as mock from '../../../__mocks__/env-exam';
import { constructUserExam } from '../utils/exam';

describe('/exam-environment/', () => {
  setupServer();
  describe('Authenticated user with exam environment authorization token', () => {
    let superPost: ReturnType<typeof createSuperRequest>;
    let examEnvironmentAuthorizationToken: string;

    // Authenticate user
    beforeAll(async () => {
      const setCookies = await devLogin();
      superPost = createSuperRequest({ method: 'POST', setCookies });
      await mock.seedEnvExam();
      // Add exam environment authorization token
      const res = await superPost('/user/exam-environment/token');
      expect(res.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      examEnvironmentAuthorizationToken =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        res.body.data.examEnvironmentAuthorizationToken;
    });

    describe('POST /exam-environment/exam/attempt', () => {
      afterEach(async () => {
        await fastifyTestInstance.prisma.envExamAttempt.deleteMany();
      });

      it('should return an error if there are no current exam attempts matching the given id', async () => {
        const body: Static<typeof examEnvironmentPostExamAttempt.body> = {
          attempt: {
            examId: mock.oid(),
            questionSets: []
          }
        };
        const res = await superPost('/exam-environment/exam/attempt')
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          )
          .send(body);

        expect(res.body).toStrictEqual({
          code: 'FCC_ERR_EXAM_ENVIRONMENT_EXAM_ATTEMPT',
          // NOTE: message may not necessarily be a part of the api compatability guarantee.
          //       That is, it could be changed without requiring a major version bump, because it is just
          //       a human-readable/debug message.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          message: expect.any(String)
        });
        expect(res.status).toBe(404);
      });

      it('should return an error if the given exam id does not match an existing exam', async () => {
        const examId = mock.oid();
        // Create exam attempt with bad exam id
        await fastifyTestInstance.prisma.envExamAttempt.create({
          data: {
            examId,
            generatedExamId: mock.oid(),
            needsRetake: false,
            startTimeInMS: Date.now(),
            userId: defaultUserId
          }
        });
        const body: Static<typeof examEnvironmentPostExamAttempt.body> = {
          attempt: {
            examId,
            questionSets: []
          }
        };
        const res = await superPost('/exam-environment/exam/attempt')
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          )
          .send(body);

        expect(res.body).toStrictEqual({
          code: 'FCC_ENOENT_EXAM_ENVIRONMENT_MISSING_EXAM',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          message: expect.any(String)
        });
        expect(res.status).toBe(404);
      });

      it('should return an error if the attempt has expired', async () => {
        // Create exam attempt with expired time
        await fastifyTestInstance.prisma.envExamAttempt.create({
          data: {
            examId: mock.examId,
            generatedExamId: mock.oid(),
            needsRetake: false,
            startTimeInMS: Date.now() - (1000 * 60 * 60 * 2 + 1000),
            userId: defaultUserId
          }
        });
        const body: Static<typeof examEnvironmentPostExamAttempt.body> = {
          attempt: {
            examId: mock.examId,
            questionSets: []
          }
        };
        const res = await superPost('/exam-environment/exam/attempt')
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          )
          .send(body);

        expect(res.body).toStrictEqual({
          code: 'FCC_EINVAL_EXAM_ENVIRONMENT_EXAM_ATTEMPT',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          message: expect.any(String)
        });
        expect(res.status).toBe(403);
      });

      it('should return an error if there is no matching generated exam', async () => {
        // Create exam attempt with no matching generated exam
        await fastifyTestInstance.prisma.envExamAttempt.create({
          data: {
            examId: mock.examId,
            generatedExamId: mock.oid(),
            needsRetake: false,
            startTimeInMS: Date.now(),
            userId: defaultUserId
          }
        });
        const body: Static<typeof examEnvironmentPostExamAttempt.body> = {
          attempt: {
            examId: mock.examId,
            questionSets: []
          }
        };
        const res = await superPost('/exam-environment/exam/attempt')
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          )
          .send(body);

        expect(res.body).toStrictEqual({
          code: 'FCC_ENOENT_EXAM_ENVIRONMENT_GENERATED_EXAM',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          message: expect.any(String)
        });
        expect(res.status).toBe(404);
      });

      it('should return an error if the attempt does not match the generated exam', async () => {
        const attempt = await fastifyTestInstance.prisma.envExamAttempt.create({
          data: { ...mock.examAttempt, userId: defaultUserId }
        });

        attempt.questionSets[0]!.id = mock.oid();

        const body: Static<typeof examEnvironmentPostExamAttempt.body> = {
          attempt
        };

        const res = await superPost('/exam-environment/exam/attempt')
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          )
          .send(body);

        expect(res.body).toStrictEqual({
          code: 'FCC_EINVAL_EXAM_ENVIRONMENT_EXAM_ATTEMPT',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          message: expect.any(String)
        });
        expect(res.status).toBe(400);

        // Database should mark attempt as `needsRetake`
        const updatedAttempt =
          await fastifyTestInstance.prisma.envExamAttempt.findUnique({
            where: { id: attempt.id }
          });
        expect(updatedAttempt).toHaveProperty('needsRetake', true);
      });

      it('should return 200 if request is valid, and update attempt in database', async () => {
        const attempt = await fastifyTestInstance.prisma.envExamAttempt.create({
          data: {
            userId: defaultUserId,
            examId: mock.examId,
            generatedExamId: mock.generatedExam.id,
            startTimeInMS: Date.now(),
            questionSets: [],
            needsRetake: false
          }
        });

        const body: Static<typeof examEnvironmentPostExamAttempt.body> = {
          attempt: mock.examAttemptSansSubmissionTimeInMS
        };

        const res = await superPost('/exam-environment/exam/attempt')
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          )
          .send(body);

        expect(res.status).toBe(200);

        // Database should update attempt
        const updatedAttempt =
          await fastifyTestInstance.prisma.envExamAttempt.findUnique({
            where: { id: attempt.id }
          });

        expect(updatedAttempt).toMatchObject(body.attempt);
      });
    });

    describe('POST /exam-environment/generated-exam', () => {
      afterEach(async () => {
        await fastifyTestInstance.prisma.envExamAttempt.deleteMany();
        await mock.seedEnvExam();
      });

      it('should return an error if the given exam id is invalid', async () => {
        const body: Static<typeof examEnvironmentPostExamGeneratedExam.body> = {
          examId: mock.oid()
        };
        const res = await superPost('/exam-environment/exam/generated-exam')
          .send(body)
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          );

        expect(res.body).toStrictEqual({
          code: 'FCC_ENOENT_EXAM_ENVIRONMENT_MISSING_EXAM',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          message: expect.any(String)
        });
        expect(res.status).toBe(404);
      });

      xit('should return an error if the exam prerequisites are not met', async () => {
        // TODO: Waiting on prerequisites
      });

      it('should return an error if the exam has been attempted in the last 24 hours', async () => {
        const recentExamAttempt = {
          ...mock.examAttempt,
          // Set start time such that exam has expired, but 0 hours have passed
          startTimeInMS: Date.now() - mock.exam.config.totalTimeInMS
        };
        await fastifyTestInstance.prisma.envExamAttempt.create({
          data: recentExamAttempt
        });

        const body: Static<typeof examEnvironmentPostExamGeneratedExam.body> = {
          examId: mock.examId
        };

        const res = await superPost('/exam-environment/exam/generated-exam')
          .send(body)
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          );

        expect(res).toMatchObject({
          status: 429,
          body: {
            code: 'FCC_EINVAL_EXAM_ENVIRONMENT_PREREQUISITES'
          }
        });

        await fastifyTestInstance.prisma.envExamAttempt.update({
          where: {
            id: recentExamAttempt.id
          },
          data: {
            // Set start time such that exam has expired, but 24 hours - 1s has passed
            startTimeInMS:
              Date.now() -
              (mock.exam.config.totalTimeInMS + (24 * 60 * 60 * 1000 - 1000))
          }
        });

        const body2: Static<typeof examEnvironmentPostExamGeneratedExam.body> =
          {
            examId: mock.examId
          };

        const res2 = await superPost('/exam-environment/exam/generated-exam')
          .send(body2)
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          );

        expect(res2).toMatchObject({
          status: 429,
          body: {
            code: 'FCC_EINVAL_EXAM_ENVIRONMENT_PREREQUISITES'
          }
        });

        await fastifyTestInstance.prisma.envExamAttempt.update({
          where: {
            id: recentExamAttempt.id
          },
          data: {
            // Set start time such that exam has expired, but 24 hours + 1s has passed
            startTimeInMS:
              Date.now() -
              (mock.exam.config.totalTimeInMS + (24 * 60 * 60 * 1000 + 1000))
          }
        });
        // Generate new exam for user to be assigned
        const newGeneratedExam = structuredClone(mock.generatedExam);
        newGeneratedExam.id = mock.oid();
        await fastifyTestInstance.prisma.envGeneratedExam.create({
          data: newGeneratedExam
        });

        const body3: Static<typeof examEnvironmentPostExamGeneratedExam.body> =
          {
            examId: mock.examId
          };

        const res3 = await superPost('/exam-environment/exam/generated-exam')
          .send(body3)
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          );

        // Time is greater than 24 hours. So, request should pass, and new exam should be generated
        expect(res3).toMatchObject({
          status: 200,
          body: {
            data: {
              examAttempt: {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                id: expect.not.stringMatching(mock.examAttempt.id)
              }
            }
          }
        });
      });

      it('should return the current attempt if it is still ongoing', async () => {
        const latestAttempt =
          await fastifyTestInstance.prisma.envExamAttempt.create({
            data: mock.examAttempt
          });

        const body: Static<typeof examEnvironmentPostExamGeneratedExam.body> = {
          examId: mock.examId
        };

        const res = await superPost('/exam-environment/exam/generated-exam')
          .send(body)
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          );

        expect(res).toMatchObject({
          status: 200,
          body: {
            data: {
              examAttempt: latestAttempt
            }
          }
        });
      });

      it('should return an error if Camper has taken all generated exams', async () => {
        // Add completed attempt for generated exam
        const submittedAttempt = structuredClone(mock.examAttempt);
        // Long-enough ago to be considered "submitted", and not trigger cooldown
        submittedAttempt.startTimeInMS =
          Date.now() -
          24 * 60 * 60 * 1000 -
          mock.exam.config.totalTimeInMS -
          1 * 60 * 60 * 1000;
        submittedAttempt.submissionTimeInMS =
          Date.now() - mock.exam.config.totalTimeInMS - 24 * 60 * 60 * 1000;
        await fastifyTestInstance.prisma.envExamAttempt.create({
          data: submittedAttempt
        });

        const body: Static<typeof examEnvironmentPostExamGeneratedExam.body> = {
          examId: mock.examId
        };
        const res = await superPost('/exam-environment/exam/generated-exam')
          .send(body)
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          );

        expect(res).toMatchObject({
          status: 500,
          body: {
            code: 'FCC_ERR_EXAM_ENVIRONMENT'
          }
        });
      });

      it('should store an empty exam attempt in the database', async () => {
        const body: Static<typeof examEnvironmentPostExamGeneratedExam.body> = {
          examId: mock.examId
        };
        const res = await superPost('/exam-environment/exam/generated-exam')
          .send(body)
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          );

        expect(res.status).toBe(200);

        const generatedExam =
          await fastifyTestInstance.prisma.envGeneratedExam.findFirst({
            where: { examId: mock.examId }
          });

        expect(generatedExam).toBeDefined();

        const examAttempt =
          await fastifyTestInstance.prisma.envExamAttempt.findFirst({
            where: { generatedExamId: generatedExam!.id }
          });

        expect(examAttempt).toEqual({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          id: expect.any(String),
          userId: defaultUserId,
          examId: mock.examId,
          generatedExamId: generatedExam!.id,
          questionSets: [],
          needsRetake: false,
          submissionTimeInMS: null,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          startTimeInMS: expect.any(Number)
        });
      });

      it('should unwind (delete) the exam attempt if the user exam cannot be constructed', async () => {
        const _mockConstructUserExam = jest
          .spyOn(await import('../utils/exam'), 'constructUserExam')
          .mockImplementationOnce(() => {
            throw new Error('Test error');
          });

        const body: Static<typeof examEnvironmentPostExamGeneratedExam.body> = {
          examId: mock.examId
        };
        const res = await superPost('/exam-environment/exam/generated-exam')
          .send(body)
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          );

        expect(res.status).toBe(500);

        const examAttempt =
          await fastifyTestInstance.prisma.envExamAttempt.findFirst({
            where: { examId: mock.examId }
          });

        expect(examAttempt).toBeNull();
      });

      it('should return the user exam with the exam attempt', async () => {
        const body: Static<typeof examEnvironmentPostExamGeneratedExam.body> = {
          examId: mock.examId
        };
        const res = await superPost('/exam-environment/exam/generated-exam')
          .send(body)
          .set(
            'exam-environment-authorization-token',
            examEnvironmentAuthorizationToken
          );

        expect(res.status).toBe(200);

        const generatedExam =
          await fastifyTestInstance.prisma.envGeneratedExam.findFirst({
            where: { examId: mock.examId }
          });

        expect(generatedExam).toBeDefined();

        const examAttempt =
          await fastifyTestInstance.prisma.envExamAttempt.findFirst({
            where: { generatedExamId: generatedExam!.id }
          });

        const userExam = constructUserExam(generatedExam!, mock.exam);

        expect(res).toMatchObject({
          status: 200,
          body: {
            data: {
              examAttempt,
              exam: userExam
            }
          }
        });
      });
    });

    xdescribe('POST /exam-environment/screenshot', () => {});
  });

  describe('Authenticated user without exam environment authorization token', () => {
    let superPost: ReturnType<typeof createSuperRequest>;

    // Authenticate user
    beforeAll(async () => {
      const setCookies = await devLogin();
      superPost = createSuperRequest({ method: 'POST', setCookies });
      await mock.seedEnvExam();
    });
    describe('POST /exam-environment/exam/attempt', () => {
      it('should return 403', async () => {
        const body: Static<typeof examEnvironmentPostExamAttempt.body> = {
          attempt: {
            examId: mock.oid(),
            questionSets: []
          }
        };
        const res = await superPost('/exam-environment/exam/attempt')
          .send(body)
          .set('exam-environment-authorization-token', 'invalid-token');

        expect(res.status).toBe(403);
      });
    });

    describe('POST /exam-environment/exam/generated-exam', () => {
      it('should return 403', async () => {
        const body: Static<typeof examEnvironmentPostExamGeneratedExam.body> = {
          examId: mock.oid()
        };
        const res = await superPost('/exam-environment/exam/generated-exam')
          .send(body)
          .set('exam-environment-authorization-token', 'invalid-token');

        expect(res.status).toBe(403);
      });
    });

    describe('POST /exam-environment/screenshot', () => {
      it('should return 403', async () => {
        const res = await superPost('/exam-environment/screenshot').set(
          'exam-environment-authorization-token',
          'invalid-token'
        );

        expect(res.status).toBe(403);
      });
    });

    describe('POST /exam-environment/token/verify', () => {
      it('should allow a valid request', async () => {
        const res = await superPost('/exam-environment/token/verify').set(
          'exam-environment-authorization-token',
          'invalid-token'
        );

        expect(res).toMatchObject({
          status: 200,
          body: {
            code: 'FCC_EINVAL_EXAM_ENVIRONMENT_AUTHORIZATION_TOKEN'
          }
        });
      });
    });
  });
});
