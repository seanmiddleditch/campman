import * as React from 'react';
import * as MarkdownIt from 'markdown-it';
import { History } from 'history';

require('../styles/markdown.css');

export interface MarkupProps
{
    markup: string,
    history?: History
}
export default class Markdown extends React.Component<MarkupProps, undefined>
{
    private md: MarkdownIt.MarkdownIt;

    constructor(props: MarkupProps)
    {
        super(props);

        this.md = new MarkdownIt({
            html: true,
            breaks: true,
            linkify: true,
            typographer: true
        });
        this.md.use(Markdown.wikiPlugin);
    }

    private static escapeHtml(text: string)
    {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    private _interceptLink(ev: React.SyntheticEvent<EventTarget>)
    {
        if (this.props.history && ev && ev.target && (ev.target as HTMLLinkElement).href)
        {
            const url = new URL((ev.target as HTMLLinkElement).href);
            if (url.origin == window.location.origin)
            {
                this.props.history.push(url.pathname);
                ev.stopPropagation();
                ev.preventDefault();
                return false;
            }
        }
        return true;
    }

    private static wikiPlugin(md: MarkdownIt.MarkdownIt)
    {
        const id = 'WIKI_LINK';
        md.inline.ruler.push(id, (state: any) => {
            const startPos = state.src.indexOf('[[', state.pos);
            if (startPos != -1)
            {
                const endPos = state.src.indexOf(']]', startPos + 2);
                if (endPos != -1)
                {
                    const content = state.src.slice(startPos + 2, endPos);
                    
                    const token = state.push(id, '', 0);
                    state.pos += 4 + content.length;

                    const [slug, title] = content.split('|', 2).map((s: string) => s.trim());
                    token.meta = {slug, title: title && title.length ? title : slug}
                    
                    return true;
                }
            }
            return false;
        });

        md.renderer.rules[id] = (tokens, id, options, env) => {
            const token = tokens[id];
            const slug = token.meta.slug.replace(/[^a-zA-Z0-9]+/, ' ').trim().replace(' ', '-');
            const title = token.meta.title.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
            return '<a href="/n/' + encodeURIComponent(slug) + '">' + Markdown.escapeHtml(title) + '</a>';
        };
    }

    render()
    {
        const html = this.md.render(this.props.markup);
        return <div className='markdown' dangerouslySetInnerHTML={{__html: html}} onClick={(ev) => this._interceptLink(ev)}/>
    }
}