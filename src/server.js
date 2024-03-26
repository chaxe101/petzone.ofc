import fastify from "fastify";
import z from 'zod'
import pgk from "bcryptjs"
import {prisma} from './lib/prisma.js'

const {hash} = pgk

const app = fastify()

app.post('/users', async (Request, reply) => {
    const registerBodySchema = z.object({
        name: z.string(),
        email: z.string(),
        password: z.string().min(6)
    })
    // Ddos que precisam ser colocados no body
    const {name, email, password} = registerBodySchema.parse(Request.body)
    // criptografa senha
    const password_hash = await bcrypt.hash(password, 6)
    // verificar se o e-mail existe no banco de dados
    const userWithSameEmail = await prisma.users.findUnique({
        where:{
            email
        }
    })

    // se existir mostrar um erro
    if(userWithSameEmail){
        return reply.status(409).send({message: 'E-mail já existe'})
    }
    // criar cadastro do banco de dados
    await prisma.users.create({
        data:{
            name,
            email,
            password_hash
        }
    })
    return reply.status(201).send()
})

app.post('/authenticate',async(request, reply) => {
    try{
        const registerBodySchema = z.object({
            email: z.string(),
            password: z.string().min(6)
        })
        const {email, password} = registerBodySchema.parse(request.body)
        const user = await prisma.users.findUnique({
            where:{
                email: email
            }
        })
        if(!user){
            return reply.status(409).send({message: 'E-mail não existe'})
        }
        const doespasswordWhatches = await compare(password, user.password_hash)
        if(!doespasswordWhatches){
            return reply.status(409).send({message: 'Credenciais inválidas'})
        }
    }catch{}
})

app.listen({
    host:'0.0.0.0',
    port: '3333'
}).then(() => {
    console.log('🚀Servidor Rodando na porta 3333');
})
