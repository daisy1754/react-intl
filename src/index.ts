/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
import parser from 'intl-messageformat-parser'
import IntlMessageFormat from 'intl-messageformat/lib/core'
IntlMessageFormat.__parse = parser.parse

// Have to repeat this bc rollup issue where it
// puts all `export * from './core'` under `default` export
export * from './types';
export {default as defineMessages} from './define-messages';

export {
  default as injectIntl,
  Context as IntlContext,
  WithIntlProps,
  WrappedComponentProps,
} from './components/injectIntl';
export {default as useIntl} from './components/useIntl';
export {default as IntlProvider} from './components/provider';
export {default as FormattedDate} from './components/date';
export {default as FormattedTime} from './components/time';
export {default as FormattedRelativeTime} from './components/relative';
export {default as FormattedNumber} from './components/number';
export {default as FormattedPlural} from './components/plural';
export {default as FormattedMessage} from './components/message';
export {default as FormattedHTMLMessage} from './components/html-message';
export {generateIntlContext} from './test-utils';
