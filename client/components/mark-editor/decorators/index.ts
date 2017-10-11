import {CompositeDecorator} from 'draft-js'
import {wikiLinkDecorator} from './wiki-link'

export const decorators = new CompositeDecorator([
    wikiLinkDecorator
])
