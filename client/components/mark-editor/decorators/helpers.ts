import {ContentBlock} from 'draft-js'

// https://github.com/draft-js-plugins/find-with-regex/blob/master/src/index.js
export const findWithRegex = (regex: RegExp, contentBlock: ContentBlock, callback: (start: number, end: number, match: RegExpExecArray) => void) => {
    const text = contentBlock.getText()
    let matchArr
    while ((matchArr = regex.exec(text)) !== null)
    {
        const start = matchArr.index
        callback(start, start + matchArr[0].length, matchArr)
    }
}
