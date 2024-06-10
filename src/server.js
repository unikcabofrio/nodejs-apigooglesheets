// src/index.js
import * as dotenv from 'dotenv';
import { fastify } from "fastify"
import { GetAllData } from "./api/googleSheets.js";

// Configuranção dos servidor
dotenv.config();
const serve = fastify()

// MEMORIA
let lastUpdate = 0
let planilhas = []

async function GetUpdate() {
    const time1 = new Date(lastUpdate).getTime();
    const time2 = new Date().getTime();
    const differenceInMilliseconds = Math.abs(time2 - time1);
    const differenceInSeconds = differenceInMilliseconds / (1000 * 60);

    if (differenceInSeconds > 5) {
        const res = await GetAllData()
        lastUpdate = res[0]
        planilhas = res[1]
    }
}

// BUSCAR TODAS AS PLANILHAS OU PELO NOME DE CADA
serve.get('/sheet/:name', async (request, reply) => {
    GetUpdate().then(() => {})

    try {
        const sheet = request.params.name
        if (sheet) {
            const data = planilhas.filter((item) => item.sheet == sheet);
            return reply.send({ result: true, planilhas: data });
        } else {
            return reply.send({ result: true, planilhas });
        }
    } catch (error) {
        return reply.status(500).send({ error: error.message });
    }

});

// BUSCAR PELO NOME DA PLANILHA E PELO ID
serve.get('/sheet/:name/:id', async (request, reply) => {
    try {
        const sheet = request.params.name
        const id = request.params.id
        if (sheet || id) {
            const data = planilhas.filter((item) => item.sheet == sheet);
            const value = data[0].data.filter((item) => item.id == id);
            return reply.send({ result: true, value });
        } else {
            return reply.send({ result: false });
        }
    } catch (error) {
        return reply.status(500).send({ error: error.message });
    }
});

// EDITAR PELO NOME DA PLANILHA E PELO ID
serve.post('/sheet/:name/:id', async (request, reply) => {
    try {
        const sheet = request.params.name
        const id = request.params.id
        const dataBody = request.body
        if (sheet || id) {
            const data = planilhas.filter((item) => item.sheet == sheet);
            const value = data[0].data.filter((item) => item.id == id);

            return reply.send({ result: true ,dataBody});
        } else {
            return reply.send({ result: false });
        }
    } catch (error) {
        return reply.status(500).send({ error: error.message });
    }
});


serve.listen({
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0'
}, async (err) => {
    if (err) throw err
    console.log(`\nHTTP server running`);

    GetUpdate().then(() => {})
})