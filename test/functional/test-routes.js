const chai = require('chai');
const mockRequire = require('mock-require');
const request = require('supertest');

const expect = chai.expect;

class cloudantMock {
  constructor() {
    this.db = {
      create: () => Promise.resolve(),
      use: () => {
        return {
          insert: (name) =>
            Promise.resolve({
              _id: 'id',
              display_id: 'display_id',
              language: 'en-US',
              answerText: 'testing',
              timestamp: 'timestamp',
            }),
        };
      },
    };
  }
}

let server;
before(() => {
  mockRequire('@cloudant/cloudant', cloudantMock);
  server = require('../../server/server');
});

after(() => {
  mockRequire.stopAll();
});

// example functional tests of routes
describe('GET /', () => {
  it('responds with homepage', () => {
    return request(server)
      .get('/')
      .expect('Content-Type', 'text/html; charset=UTF-8')
      .expect(200)
      .then((response) => {
        expect(response.text).to.include('IBM Cloud - Node.js + Cloudant');
      });
  });
});

describe('GET /health', () => {
  it('responds with json', () => {
    return request(server)
      .get('/health/')
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200, {
        status: 'UP',
      });
  });
});

describe('POST /fake/route', () => {
  it('responds with not found page', () => {
    return request(server)
      .post('/fake/route')
      .expect('Content-Type', 'text/html; charset=UTF-8')
      .expect(200)
      .then((response) => {
        expect(response.text).to.include(
          "Whoops! Looks like you got lost or couldn't find your page.",
        );
      });
  });
});

describe('POST /api/answers', () => {
  it('responds with created', () => {
    return request(server)
      .post('/api/answers')
      .send({
        _id: 'displayid:en-US',
        display_id: 'displayid',
        language: 'en-US',
        answerText: 'testing',
        timestamp: '2021-02-17T12:18:43.123Z',
      })
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(400);
  });

  it('responds with bad request', () => {
    return request(server)
      .post('/api/answers')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(400);
  });
});
