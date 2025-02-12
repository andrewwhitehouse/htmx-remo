import { Database } from "bun:sqlite";

type Book = {id: string; name: string; author: string; yearPublished?: number};

function init(): Database {
    const db = new Database("db.sqlite");
    db.exec(`CREATE TABLE IF NOT EXISTS books (
            id VARCHAR PRIMARY KEY,
            name VARCHAR NOT NULL,
            author VARCHAR NOT NULL,
            year_published INTEGER
    )`)
    return db;
}

function create(db: Database, book: Book) {
    const sql = `INSERT INTO books (id, name, author, year_published)
                    VALUES (:id, :name, :author, :yearPublished)`;

    const stmt = db.prepare(sql);

    const result = stmt.run({
        ":id": book.id,
        ":name": book.name,
        ":author": book.author,
        ":yearPublished": book.yearPublished || null
    });
}

function del(db: Database, id: string) {
    const sql = `DELETE FROM books WHERE id = :id`;

    const stmt = db.prepare(sql);

    const result = stmt.run({
        ":id": id
    });
}

interface QueryResult {
    id: string,
    name: string,
    author: string,
    year_published: number
}

function findAll(db: Database): Book[] {
    const query = db.query("SELECT id, name, author, year_published FROM books");
    const books = query.all() as QueryResult[];
    let ret: Array<Book> = [];
    books.forEach((b: QueryResult) => {
        ret.push({"id": b.id, "name": b.name, "author": b.author, "yearPublished": b.year_published});
    })
    //console.log("findAll " + JSON.stringify(books));
    return ret;
}

export {init, create, findAll, Book, del};