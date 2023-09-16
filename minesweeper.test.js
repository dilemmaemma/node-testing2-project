const request = require('supertest');

const server = require('./api/server.js');
const db = require('./data/dbConfig.js');
const model = require('./api/highscore/model.js');

beforeAll(async () => {
    await db.migrate.rollback()
    await db.migrate.latest()
})

beforeEach(async () => {
    await db.seed.run()
})

afterAll(async () => {
    await db.destroy()
})

it('[0] sanity check', () => {
    expect(true).not.toBe(false)
});

describe('server.js', () => {
  describe('index route', () => {
    it('[1] responds with the correct message', async () => {
      const expectedBody = { api: 'running' };

      const response = await request(server).get('/');

      expect(response.body).toEqual(expectedBody);
    });
  });
});

describe('customBoard.js', () => {
    describe('Test route', () => {
        it('[2] responds with the correct message', async () => {
            const expectedBody = { message: 'Custom board test route is working' };

            const response = await request(server).get('/api/customboard/test');

            expect(response.body).toEqual(expectedBody);
        })

    })

    describe('[GET] /api/customboard', () => {
        it('[3] responds with the correct status and message', async () => {
            const response = await request(server).get('/api/customboard/board');
            const res = await request(server).post('/api/customboard/board').send({ height: 10, width: 10, bombs: 30 });

            expect(response.body.message).toBe(undefined);
            expect(response.status).toBe(200)
            expect(res.body.message).toMatch(/board created/i)
            expect(res.status).toBe(201)
        });
    })

    describe('[POST] /api/customboard', () => {
        it('[4] responds with the correct status and message upon valid entry', async () => {
            const response = await request(server).post('/api/customboard/board').send({ height: 10, width: 10, bombs: 10 });

            expect(response.body.message).toMatch(/board created/i);
            expect(response.status).toBe(201);
        })

        it('[5] response with the correct status and message upon invalid entry', async () => {
            const response = await request(server).post('/api/customboard/board').send({ height: 10, bombs: 10});

            expect(response.body.message).toMatch(/width must be between 8 and 50/i);
            expect(response.status).toBe(500);

            const res = await request(server).post('/api/customboard/board').send({ width: 10, bombs: 10});

            expect(res.body.message).toMatch(/height must be between 8 and 50/i);
            expect(res.status).toBe(500);

            const resp = await request(server).post('/api/customboard/board').send({ width: 10, height: 10});

            expect(resp.body.message).toMatch(/bombs must be between 1 and 50/i);
            expect(resp.status).toBe(500);
        })
    })
})

describe('highscore.js', () => {
    beforeEach(async () => {
        await db('gamemode').truncate();
        await db('username').truncate();
    });

    describe('Test route', () => {
        it('[6] responds with the correct message', async () => {
            const expectedBody = { message: 'Custom board test route is working' };

            const response = await request(server).get('/api/highscore/test');

            expect(response.body).toEqual(expectedBody);
        });
    });

    describe('[GET] /api/highscore', () => {
        it('[7] responds with the correct message', async () => {
            await model.add(
                { 
                    name: 'BigGamer2000', 
                    gamemode: 'Easy', 
                    seconds: '15', 
                    ip_address: '16.159.42.190' 
                }
            );
            await model.add(
                {
                    name: 'HighRoler', 
                    gamemode: 'Expert', 
                    seconds: '35', 
                    ip_address: '18.159.42.170' 
                }
            );

            const username = await model.find()

            expect(username).toMatchObject([{ name: 'BigGamer2000', time: 15, difficulty: 'Easy' }, { name: 'HighRoler', time: 35, difficulty: 'Expert' }])
        });
    });

    describe('[GET] /api/highscore/:username', () => {
        it('[8] returns proper player', async () => {
            await model.add(
                { 
                    name: 'BigGamer2000', 
                    gamemode: 'Easy', 
                    seconds: '15', 
                    ip_address: '16.159.42.190'
                }
            );
            await model.add(
                { 
                    name: 'HighRoler', 
                    gamemode: 'Expert', 
                    seconds: '35', 
                    ip_address: '18.159.42.170'
                }
            );
            await model.add(
                { 
                    name: 'TopScorer2023', 
                    gamemode: 'Intermediate', 
                    seconds: 45, 
                    ip_address: '10.0.0.45'
                }
            )
            
            const find = model.findBy({ username: 'HighRoler' })

            expect(find).toMatchObject({ name: 'HighRoler', time: 35, difficulty: 'Expert'})
        })
    })

    describe('[POST] /api/highscore', () => {
        it('[9] responds with the correct status and message', async () => {
            const res = await request(server).post('/api/highscore').send({ name: 'GameChampion42', gamemode: 'Easy', seconds: 2 })

            expect(res.body).toMatchObject({ name: 'GameChampion42', time: 2, difficulty: 'Easy'})
            expect(res.status).toBe(201)
        });

        it('[10] responds with the proper status and error message', async () => {
            const res = await request(server).post('/api/highscore').send({ name: 'Bob' })

            expect(res.body).toEqual({ message: 'Must include name, gamemode, and total seconds' })
            expect(res.status).toBe(500)
        })
    })
})