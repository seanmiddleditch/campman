class RenderMarkup extends React.Component
{
    constructor(props)
    {
        super(props);

        this.md = new markdownit({
            html: true,
            breaks: true,
            linkify: true,
            typographer: true
        }).use(this.wikiPlugin);
    }

    wikiPlugin(md)
    {
        const id = 'WIKI_LINK';
        md.inline.ruler.push(id, (state, silent) => {
            const startPos = state.src.indexOf('[[', state.pos);
            if (startPos != -1)
            {
                const endPos = state.src.indexOf(']]', startPos + 2);
                if (endPos != -1)
                {
                    const content = state.src.slice(startPos + 2, endPos);
                    console.log(content);
                    
                    const token = state.push(id, '', 0);
                    state.pos += 4 + content.length;

                    const [slug, title] = content.split('|', 2).map(s => s.trim());
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
            return '<a href="/n/' + slug + '">' + title + '</a>';
        };
    }

    render()
    {
        const html = this.md.render(this.props.markup);
        return <div dangerouslySetInnerHTML={{__html: html}}/>
    }
}