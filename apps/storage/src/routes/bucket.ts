import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'
import { error } from 'node:console'
import z, { number } from 'zod'

const app = new Hono()

const createSchema = z.object({
    name: z.string().min(1),
    bday: z.coerce.date().optional()
})

const updateSchema = z.object({ //all optional since you can also only update a singular value, nullable when something caan be deleted. 
    name: z.string().min(1).optional(),
    bday: z.coerce.date().nullable().optional()
})

const tempArr: {id: Number, name: string, bday?: Date | null}[] = [
    {
        id: 1,
        name: 'Marko',
        bday: new Date()
    },
    {
        id: 2,
        name: 'Miriam',
    }
]

app.get("/", (c) => {
    return c.json(tempArr)
})


app.get("/:id", (c) => {
    const id = Number(c.req.param("id"))

    const tmp = tempArr.find(obj => obj.id == id)

    if (tmp == null){
        return c.json({error: "id not found"}, 404)
    }

    return c.json(tmp)
})

app.post("/", sValidator("json", createSchema), (c) => {
    const data = c.req.valid("json")

    const createdTmp = {id: (+tempArr[(tempArr.length - 1)].id + 1), ...data}
    tempArr.push(createdTmp)

    return c.json(createdTmp, 201)

})

app.put("/:id", sValidator("json", updateSchema), (c) => {
    const id: number = +c.req.param("id")
    const data = c.req.valid("json")

    const foundTmp = tempArr.find(obj => obj.id == id)

    if (foundTmp == null) {
        return c.json({error: "No id found"}, 404)
    }

    if (data.name != undefined){
        foundTmp.name = data.name
    }

    if (data.bday != undefined){
        foundTmp.bday = data.bday
    }

    tempArr[(id - 1)] = (foundTmp)

    return c.json(tempArr) 
})

app.delete("/:id", (c) => {
    const id = Number(c.req.param("id"))

    const index = tempArr.findIndex(obj => obj.id == id)

    if (index == -1) {
        return c.json({error: "No id found"}, 404)
    }

    tempArr.splice((index - 1), 1)

    return c.body(null, 204) 
})

export default app