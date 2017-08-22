import {Request, Response, Router} from "express";
import {Label, Note} from "../models/note";
import {Connection} from "typeorm";
import {Converter} from "showdown";

export function noteRouter(connection: Connection)
{
    const router = Router();
    const converter = new Converter();
    const notes = connection.getRepository(Note);

    router.get('/notes', async (req, res, next) => {
        try {
            const all = await notes.find({relations: ['labels']});
            res.render('notes.hbs', {notes: all});
        } catch (err) {
            console.error(err);
            next();
        }
    })

    router.get('/notes/create', (req, res) => {
        res.render('new-note.hbs');
    });
    router.post('/notes/create', async (req, res, next) => {
        try {
            const note = new Note();
            note.tag = req.body.tag;
            note.title = req.body.title;
            note.labels = await Label.reify(connection, Label.fromString(req.body.labels));
            note.body = req.body.body;

            await notes.save(note);
            res.redirect(req.body.tag);
        } catch (err) {
            console.error(err);
            next();
        }
    });

    router.get('/n/:tag/edit', async (req, res, next) => {
        try {
            const note = await notes.findOne({where: {tag: req.params.tag}, relations: ['labels']});
            if (note) {
                res.render('edit-note.hbs', {note: note});
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            next();
        }
    });
    router.post('/n/:tag/edit', async (req, res, next) => {
        try {
            const note = await notes.findOne({where: {tag: req.params.tag}, relations: ['labels']});
            if (note) {
                note.tag = req.body.tag;
                note.title = req.body.title;
                note.labels = await Label.reify(connection, Label.fromString(req.body.labels));
                note.body = req.body.body;

                await notes.save(note);
                res.redirect('/n/' + req.body.tag);
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            next();
        }
    });

    router.get('/n/:tag', async (req, res, next) => {
        try {
            const note = await notes.findOne({where: {tag: req.params.tag}, relations: ['labels']});
            if (note) {
                res.render('note.hbs', {note: note});
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            next();
        }
    });

    return router;
}