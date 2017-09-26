import {MarkdownIt} from 'markdown-it'

export default function wikiLinkPlugin(md: MarkdownIt)
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
        return '<a href="/n/' + encodeURIComponent(slug) + '">' + md.utils.escapeHtml(title) + '</a>';
    };
}