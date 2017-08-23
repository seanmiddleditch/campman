import * as showdown from "showdown";

showdown.extension('wiki', {
    type: 'lang',
    regex: /\[\[([^\]]+)\]\]/g,
    replace: '<a href="/n/$1">$1</a>'
});

const engine = new showdown.Converter({extensions: ['wiki']});
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

export function transform(input: string) : string
{
    return engine.makeHtml(input);
}
