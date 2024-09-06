import openDb from './db/database.mjs';

const docs = {
    /**
     * Returns all datarows from database
     * Route /
     */
    getAll: async function getAll() {
        let db = await openDb();

        try {
            return await db.all('SELECT rowid as id, * FROM documents');
        } catch (e) {
            console.error(e);

            return [];
        } finally {
            await db.close();
        }
    },

    /**
     * Returns one data row if id exists else reutrn {}
     * @param {int} id 
     */
    getOne: async function getOne(id) {
        let db = await openDb();

        try {
            return await db.get('SELECT rowid, * FROM documents WHERE rowid=?', id);
        } catch (e) {
            console.error(e);

            return {};
        } finally {
            await db.close();
        }
    },

    /**
     * Create a new data row with data
     * @param {title: text, content: textarea} body 
     */
    addOne: async function addOne(body) {
        let db = await openDb();

        try {
            return await db.run(
                'INSERT INTO documents (title, content) VALUES (?, ?)',
                body.title,
                body.content,
            );
        } catch (e) {
            console.error(e);
        } finally {
            await db.close();
        }
    },
    /**
     * Updates row data on route /Update?id=x
     * @param {title: text, content: textarea} body 
     * @param {int} id 
     */
    rowUpdate: async function rowUpdate(body, id){
        let db = await openDb();

        try {
            return await db.run(
                `UPDATE documents 
                SET title = ?, content = ?  
                WHERE rowid = ?`,
                body.title,
                body.content,
                id,
            );
        } catch (e) {
            console.error(e);
        } finally {
            await db.close();
        }
    },
};

export default docs;
