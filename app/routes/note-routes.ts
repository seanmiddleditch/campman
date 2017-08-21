import {Request, Response, Router} from "express";
import {Note} from "../models/note";
import {Connection} from "typeorm";
import {Converter} from "showdown";

export function noteRouter(connection: Connection)
{
    const router = Router();
    const converter = new Converter();
    const notes = connection.getRepository(Note);

    router.get('/', async (req, res, next) => {
        try {
            const all = await notes.find();
            res.render('notes.hbs', {notes: all});
        } catch (err) {
            console.error(err);
            next();
        }
    })

    router.get('/create', (req, res) => {
        res.render('new-note.hbs');
    });
    router.post('/create', async (req, res, next) => {
        try {
            const note = new Note();
            note.tag = req.body.tag;
            note.title = req.body.title;
            note.setLabelString(req.body.labels);
            note.body = req.body.body;

            await notes.save(note);
            res.redirect(req.body.tag);
        } catch (err) {
            console.error(err);
            next();
        }
    });

    router.get('/edit/:tag', async (req, res, next) => {
        try {
            const note = await notes.findOne({tag: req.params.tag});
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
    router.post('/edit/:tag', async (req, res, next) => {
        try {
            const note = await notes.findOne({tag: req.params.tag});
            if (note) {
                note.tag = req.body.tag;
                note.title = req.body.title;
                note.setLabelString(req.body.labels);
                note.body = req.body.body;

                await notes.save(note);
                res.redirect('/notes/' + req.body.tag);
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            next();
        }
    });

    router.get('/:tag', async (req, res, next) => {
        try {
            const note = await notes.findOne({tag: req.params.tag});
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