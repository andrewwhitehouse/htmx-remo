import {type Context, Hono} from 'hono';
import {serveStatic} from 'hono/bun';
import { Database } from "bun:sqlite";
import {init as initBook, create as createBook, del as deleteBook, Book, findAll} from './db/book';

const db = initBook();

function addBook(name: string, author: string, yearPublished?: number): Book {
    const id = crypto.randomUUID();
    const book = {id, name, author, yearPublished};
    createBook(db, book);
    return book;
}

function bookRow(book: Book) {
    return (
        <tr class="on-hover">
            <td>{book.name}</td>
            <td>{book.author}</td>
            <td>{book.yearPublished}</td>
            <td class="buttons">
                <button
                    class="show-on-hover"
                    hx-delete={`/book/${book.id}`}
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
    return c.html(<>{findAll(db).map(bookRow)}</>);  
});
app.post('/book', async (c: Context) => {
    const formData = await c.req.formData();
    const name = (formData.get('name') as string) || '';
    const author = (formData.get('author') as string) || '';
    const yearPublished = (formData.get('yearPublished') as string) || undefined;
    const dog = addBook(name, author, typeof(yearPublished) !== 'undefined' ? parseInt(yearPublished) : undefined);
    console.log(JSON.stringify(dog));
    return c.html(bookRow(dog), 201);
});
app.delete('/book/:id', (c: Context) => {
    const id = c.req.param('id');
    deleteBook(db, id);
    return c.body(null);
});

export default app;