showdown.extension('wiki', {
    type: 'lang',
    regex: /\[\[([^\]]+)\]\]/g,
    replace: '<a href="/n/$1">$1</a>'
});

class RenderMarkup extends React.Component
{
    constructor(props)
    {
        super(props);

        const engine = this.engine = new showdown.Converter({extensions: ['wiki']});
        engine.setFlavor('github');
        engine.setOption('omitExtraWLInCodeBlocks', 'true');
        engine.setOption('ghCompatibleHeaderId', 'true');
        engine.setOption('simplifiedAutoLink', 'true');
        engine.setOption('excludeTrailingPunctuationFromURLs', 'true');
        engine.setOption('literalMidWordUnderscores', 'true');
        engine.setOption('strikethrough', 'true');
        engine.setOption('tables', 'true');
        engine.setOption('ghCodeBlocks', 'true');
        engine.setOption('tasklists', 'true');
        engine.setOption('simpleLineBreaks', 'true');
        engine.setOption('disableForced4SpacesIndentedSublists', 'true');
        engine.setOption('parseImgDimensions', 'true');
    }

    render()
    {
        const html = this.engine.makeHtml(this.props.markup);
        return <div dangerouslySetInnerHTML={{__html: html}}/>
    }
}