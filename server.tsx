import {type Context, Hono} from 'hono';
import {serveStatic} from 'hono/bun';

type Dog = {id: string; name: string; breed: string};
const dogs = new Map<string, Dog>();

function addDog(name: string, breed: string): Dog {
    const id = crypto.randomUUID();
    const dog = {id, name, breed};
    dogs.set(id, dog);
    return dog;
}

addDog('Comet', 'Whippet');
addDog('Oscar', 'German Shorthaired Pointer');

function dogRow(dog: Dog) {
    return (
        <tr class="on-hover">
            <td>{dog.name}</td>
            <td>{dog.breed}</td>
            <td class="buttons">
                <button
                    class="show-on-hover"
                    hx-delete={`/dog/${dog.id}`}
                    hx-confirm="Are you sure?"
                    hx-target="closest tr"
                    hx-swap="delete"
                >
                    ✕    
               </button>
            </td>        
        </tr>
    );
}

const app = new Hono();
app.get('/version', (c: Context) => {
    return c.html(<img alt="some description" src="https://raw.githubusercontent.com/bigskysoftware/htmx/master/www/static/img/htmx_logo.1.png" />);
});
    
app.use('/*', serveStatic({root: './'}));
app.get('/table-rows', (c: Context) => {
    const sortedDogs = Array.from(dogs.values()).toSorted((a,b) => 
        a.name.localeCompare(b.name)  
    );
    return c.html(<>{sortedDogs.map(dogRow)}</>);  
});
app.post('/dog', async (c: Context) => {
    const formData = await c.req.formData();
    const name = (formData.get('name') as string) || '';
    const breed = (formData.get('breed') as string) || '';
    const dog = addDog(name, breed);
    console.log(JSON.stringify(dog));
    return c.html(dogRow(dog), 201);
});
app.delete('/dog/:id', (c: Context) => {
    const id = c.req.param('id');
    dogs.delete(id);
    return c.body(null);
});

export default app;