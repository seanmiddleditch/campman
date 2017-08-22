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
            note.slug = req.body.slug;
            note.title = req.body.title;
            note.labels = await Label.reify(connection, Label.fromString(req.body.labels));
            note.body = req.body.body;

            await notes.save(note);
            res.redirect('/n/' + req.body.slug);
        } catch (err) {
            console.error(err);
            next();
        }
    });

    router.get('/n/:slug/edit', async (req, res, next) => {
        try {
            const note = await notes.findOne({where: {slug: req.params.slug}, relations: ['labels']});
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
    router.post('/n/:slug/edit', async (req, res, next) => {
        try {
            const note = await notes.findOne({where: {slug: req.params.slug}, relations: ['labels']});
            if (note) {
                note.slug = req.body.slug;
                note.title = req.body.title;
                note.labels = await Label.reify(connection, Label.fromString(req.body.labels));
                note.body = req.body.body;

                await notes.save(note);
                res.redirect('/n/' + req.body.slug);
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            next();
        }
    });

    router.get('/n/:slug', async (req, res, next) => {
        try {
            const note = await notes.findOne({where: {slug: req.params.slug}, relations: ['labels']});
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