import * as Handlebars from "handlebars";
import * as fs from "fs";
import {Converter} from "showdown";
import * as path from "path";

export function createEngine(viewPath: string)
{
    const markdown = new Converter();
    markdown.setFlavor('github');
    Handlebars.registerHelper('markdown', (input: string) => {
        return new Handlebars.SafeString(markdown.makeHtml(input));
    })

    const entries = fs.readdirSync(viewPath + '/partials');
    for (const fileName of entries) {
        if (fileName.endsWith('.hbs')) {
            const fullFileName = path.join(viewPath, 'partials', fileName);
            const contents = fs.readFileSync(fullFileName, 'utf8');
            const compiled = Handlebars.compile(contents);
            Handlebars.registerPartial(fileName, compiled);
        }
    }

    function template(filePath: string, options: any, callback: (err: any, body: string)=>void)
    {
        fs.readFile(filePath, 'utf8', (err, contents) => {
            if (err) {
                callback(err, undefined);
            } else {
                const template = Handlebars.compile(contents);
                const output = template(options);
                callback(undefined, output);
            }
        });
    }

    return template;
}